import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
import asyncio
from app.services.embeddings import get_text_embedding
from app.services.translation import translate_text
from app.schemas.heritage import HeritageSiteCreate, StoryCreate

class TestCulturalHeritageCoreLogic(unittest.TestCase):

    def test_text_embedding_generation(self):
        """Verify 384-dimensional vector embedding generation and L2 normalization."""
        vector = get_text_embedding("Janaki Mandir", "Ancient temple in Janakpur dedicated to Sita.")
        self.assertEqual(len(vector), 384)
        # Verify vector magnitude is normalized to ~1.0
        magnitude = sum(v * v for v in vector) ** 0.5
        self.assertAlmostEqual(magnitude, 1.0, places=3)

    def test_category_schema_validation(self):
        """Verify HeritageSiteCreate accepts both canonical and shorthand categories."""
        valid_payload = {
            "name": "Nyatapola Temple",
            "category": "temple",
            "latitude": 27.6714,
            "longitude": 85.4283,
            "initial_story": {
                "language": "en",
                "title": "Five Storey Temple",
                "content": "Historic 18th century pagoda in Bhaktapur Durbar Square."
            }
        }
        site = HeritageSiteCreate(**valid_payload)
        self.assertEqual(site.category, "temple")

        # Test canonical category variant
        valid_payload["category"] = "traditional_practice"
        site_canonical = HeritageSiteCreate(**valid_payload)
        self.assertEqual(site_canonical.category, "traditional_practice")

    def test_translation_pipeline(self):
        """Verify translation helper translates cultural keywords and prepends indicator."""
        async def run_translation():
            translated = await translate_text("Ancient temple in Janakpur", "en", "ne")
            self.assertIn("मन्दिर", translated)
            self.assertTrue(translated.startswith("[नेपाली अनुवाद]"))

        asyncio.run(run_translation())

if __name__ == "__main__":
    unittest.main()
