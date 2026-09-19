"""Selection regression tests; run with the manuscript Nix Python environment."""
import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('export_samples', Path(__file__).with_name('export-samples.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SelectionTests(unittest.TestCase):
    def test_pagination_moves(self):
        pages = ['Contents', 'Puzzle 1\nSolve on your device', 'Puzzle 2\nSolve on your device']
        anchors = [['Puzzle 1', 'Solve on your device'], ['Puzzle 2', 'Solve on your device']]
        self.assertEqual(module.select_pages(pages, anchors), [1, 2])
        self.assertEqual(module.select_pages(['New preface'] + pages, anchors), [2, 3])
    def test_missing_or_ambiguous(self):
        for pages in [['Something else'], ['Puzzle 1', 'Puzzle 1']]:
            with self.assertRaises(ValueError): module.select_pages(pages, [['Puzzle 1']])
    def test_numbers_are_not_prefixes(self):
        self.assertEqual(module.select_pages(['Puzzle 10','Puzzle 120','Puzzle 1'], [['Puzzle 1']]), [2])
    def test_punctuation_and_line_breaks(self):
        self.assertEqual(module.select_pages(['Example \u2014 X-Wing\nTrack candidate'], [['Example - X-Wing','Track candidate']]), [0])
    def test_no_duplicate_page(self):
        with self.assertRaises(ValueError): module.select_pages(['Puzzle 1'], [['Puzzle 1'],['Puzzle 1']])

class IsbnTests(unittest.TestCase):
    def test_print_formats(self):
        self.assertEqual(module.extract_isbn('ISBN: 978-1-0681462-0-6'), '9781068146206')
        self.assertEqual(module.extract_isbn('ISBN-13: 9798175488075'), '9798175488075')
    def test_missing_invalid_ambiguous(self):
        for text in ['No ISBN yet', 'ISBN: 9798175488076', 'ISBN: 9798175488075 ISBN: 9781068146206']:
            with self.assertRaises(ValueError): module.extract_isbn(text)

if __name__ == '__main__': unittest.main()
