"""Tool regression tests. Fixtures are technical, not proposed artwork."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image
from art_files import assemble, inspect_image, main, sha256


class ArtFilesTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.opaque = self.root / 'opaque.png'
        Image.new('RGB', (12, 16), (20, 30, 40)).save(self.opaque)
        self.sprite = self.root / 'sprite.png'
        image = Image.new('RGBA', (8, 10), (1, 2, 3, 0))
        image.paste((70, 80, 90, 255), (2, 2, 6, 8))
        image.putpixel((2, 3), (100, 120, 140, 128))
        image.save(self.sprite)

    def tearDown(self):
        self.temp.cleanup()

    def test_opaque_png(self):
        result = inspect_image(self.opaque, expected_size=(12, 16), alpha='opaque', expected_format='PNG')
        self.assertEqual(result['technical_status'], 'passed')
        self.assertEqual(result['visual_status'], 'not_checked')

    def test_real_alpha_and_bounds(self):
        result = inspect_image(self.sprite, alpha='required', clearance=2)
        self.assertEqual(result['technical_status'], 'passed')
        self.assertEqual(result['content_bbox'], [2, 2, 6, 8])
        self.assertEqual(result['alpha']['partial_pixels'], 1)

    def test_fake_transparency(self):
        self.assertEqual(inspect_image(self.opaque, alpha='required')['technical_status'], 'failed')

    def test_rgba_without_transparent_pixels(self):
        path = self.root / 'rgba.png'
        Image.new('RGBA', (5, 5), (0, 0, 0, 255)).save(path)
        self.assertEqual(inspect_image(path, alpha='required')['technical_status'], 'failed')

    def test_entirely_empty(self):
        path = self.root / 'empty.png'
        Image.new('RGBA', (5, 5)).save(path)
        self.assertEqual(inspect_image(path)['technical_status'], 'failed')

    def test_wrong_size(self):
        self.assertEqual(inspect_image(self.opaque, expected_size=(390, 844))['technical_status'], 'failed')

    def test_jpeg_named_png(self):
        path = self.root / 'disguised.png'
        Image.new('RGB', (5, 5)).save(path, format='JPEG')
        self.assertEqual(inspect_image(path, expected_format='PNG')['format'], 'JPEG')
        self.assertEqual(inspect_image(path)['technical_status'], 'failed')

    def test_missing_or_corrupt(self):
        for path in (self.root / 'missing.png', self.root / 'broken.png'):
            if path.name == 'broken.png':
                path.write_bytes(b'not an image')
            self.assertEqual(inspect_image(path)['technical_status'], 'failed')

    def test_budget_and_margin(self):
        self.assertEqual(inspect_image(self.sprite, max_bytes=1)['technical_status'], 'failed')
        self.assertEqual(inspect_image(self.sprite, clearance=3)['technical_status'], 'failed')

    def test_reject_animation(self):
        path = self.root / 'animated.png'
        first, second = Image.new('RGBA', (5, 5), 'red'), Image.new('RGBA', (5, 5), 'blue')
        first.save(path, save_all=True, append_images=[second], duration=100)
        self.assertEqual(inspect_image(path)['technical_status'], 'failed')

    def test_no_source_mutation_pixel_perfect_sheet(self):
        sources = [self.opaque, self.sprite]
        before = [sha256(p) for p in sources]
        out = self.root / 'sheet.png'
        index = assemble(sources, out, gap=3)
        with Image.open(out) as sheet:
            self.assertEqual(sheet.getpixel((0, 0))[3], 0)
            for source, entry in zip(sources, index['frames']):
                x, y, w, h = entry['frame']
                with Image.open(source) as original:
                    self.assertEqual(sheet.crop((x, y, x+w, y+h)).tobytes(), original.convert('RGBA').tobytes())
        self.assertEqual(before, [sha256(p) for p in sources])
        self.assertEqual(index['labels'], [])
        self.assertFalse(index['resized'])
        self.assertEqual(json.loads(out.with_suffix('.json').read_text())['frames'], index['frames'])

    def test_no_overwrite(self):
        before = sha256(self.opaque)
        with self.assertRaises(ValueError):
            assemble([self.sprite], self.opaque)
        self.assertEqual(before, sha256(self.opaque))

    def test_no_overwrite_index(self):
        out = self.root / 'sheet.png'
        out.with_suffix('.json').write_text('keep')
        with self.assertRaises(ValueError):
            assemble([self.sprite], out)
        self.assertFalse(out.exists())

    def test_no_alias_or_bad_output(self):
        out = self.root / 'sheet.png'
        with self.assertRaises(ValueError):
            assemble([self.sprite], out, index=out)
        with self.assertRaises(ValueError):
            assemble([self.sprite], self.root / 'sheet.jpg')

    def test_limit_sheet_dimensions(self):
        with self.assertRaises(ValueError):
            assemble([self.sprite] * 100, self.root / 'huge.png', columns=10, gap=1024)

    def test_profile_mismatch_rejected(self):
        path = self.root / 'profile.png'
        Image.new('RGBA', (3, 3), 'red').save(path, icc_profile=b'test-profile')
        with self.assertRaises(ValueError):
            assemble([self.sprite, path], self.root / 'sheet.png')

    def test_profile_preserved(self):
        path = self.root / 'profile.png'
        Image.new('RGBA', (3, 3), 'red').save(path, icc_profile=b'test-profile')
        out = self.root / 'sheet.png'
        assemble([path], out)
        with Image.open(out) as image:
            self.assertEqual(image.info.get('icc_profile'), b'test-profile')

    def test_cli_report_exit_codes(self):
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main(['inspect', str(self.opaque), '--format', 'PNG']), 0)
            self.assertEqual(main(['inspect', str(self.opaque), '--alpha', 'required']), 1)
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit):
                main(['inspect', str(self.opaque), '--size', '0x4'])


if __name__ == '__main__':
    unittest.main()
