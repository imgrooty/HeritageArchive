import re
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.heritage import Story

# A dictionary mapping common cultural heritage keywords between languages
TRANSLATION_DICT = {
    ("en", "ne"): {
        "temple": "मन्दिर",
        "festival": "चाडपर्व",
        "monument": "स्मारक",
        "pagoda": "प्यागोडा शैली",
        "palace": "दरबार",
        "Mithila": "मिथिला",
        "Bhaktapur": "भक्तपुर",
        "Janakpur": "जनकपुर",
        "Nepal": "नेपाल",
        "Nyatapola": "न्यातपोल",
        "Janaki Mandir": "जानकी मन्दिर",
        "Ganga Sagar": "गंगा सागर",
        "traditional": "पारम्परिक"
    },
    ("en", "mai"): {
        "temple": "मन्दिर",
        "festival": "पाबनि",
        "monument": "ऐतिहासिक धरोहर",
        "palace": "दरबार",
        "Mithila": "मिथिला",
        "Janakpur": "जनकपुर",
        "Nepal": "नेपाल",
        "Janaki Mandir": "जानकी मन्दिर",
        "Ganga Sagar": "गंगा सागर"
    },
    ("en", "bho"): {
        "temple": "मन्दिर",
        "festival": "परब",
        "monument": "धरोहर",
        "palace": "महल",
        "Mithila": "मिथिला",
        "Janakpur": "जनकपुर",
        "Nepal": "नेपाल",
        "Janaki Mandir": "जानकी मन्दिर"
    }
}

# Reverse mapping lists for local-to-english conversions
REVERSE_DICT = {}
for (src, tgt), mapping in TRANSLATION_DICT.items():
    REVERSE_DICT[(tgt, src)] = {v: k for k, v in mapping.items()}

async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    if source_lang == target_lang:
        return text

    # Select translation map
    mapping = TRANSLATION_DICT.get((source_lang, target_lang))
    if not mapping:
        mapping = REVERSE_DICT.get((source_lang, target_lang))
    if not mapping:
        # Fallback to English intermediary if direct mapping is not found
        mapping = TRANSLATION_DICT.get(("en", target_lang))

    translated = text
    if mapping:
        for src_word, tgt_word in mapping.items():
            pattern = re.compile(re.escape(src_word), re.IGNORECASE)
            translated = pattern.sub(tgt_word, translated)

    # Prefix indicators to make machine-translations visual and verifiable in UI
    lang_prefixes = {
        "ne": "[नेपाली अनुवाद] ",
        "mai": "[मैथिली अनुवाद] ",
        "bho": "[भोजपुरी अनुवाद] ",
        "en": "[English Translation] "
    }
    prefix = lang_prefixes.get(target_lang, f"[{target_lang.upper()} Translation] ")
    
    # Prepend prefix if it isn't already present
    if not translated.startswith(prefix.strip()):
        return f"{prefix}{translated}"
    return translated

async def trigger_auto_translation(site_id: int, original_story: Story, db: AsyncSession):
    target_languages = ["en", "ne", "mai", "bho"]
    if original_story.language in target_languages:
        target_languages.remove(original_story.language)

    for lang in target_languages:
        # Verify a story for this language does not exist yet
        existing_result = await db.execute(
            select(Story).where(Story.site_id == site_id, Story.language == lang)
        )
        if existing_result.scalar_one_or_none():
            continue

        translated_title = await translate_text(original_story.title, original_story.language, lang)
        translated_content = await translate_text(original_story.content, original_story.language, lang)

        translated_story = Story(
            site_id=site_id,
            language=lang,
            title=translated_title,
            content=translated_content,
            contributor_id=original_story.contributor_id,
            is_translation=True,
            translation_method="machine",
            translation_status="approved",
            original_story_id=original_story.id
        )
        db.add(translated_story)

    await db.commit()
