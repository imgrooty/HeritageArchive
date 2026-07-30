import asyncio
import os
import dotenv
from typing import Any
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

dotenv.load_dotenv("../.env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment.")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

import app.models.user  # noqa
import app.models.community  # noqa
import app.models.heritage  # noqa
import app.models.knowledge  # noqa

from app.models.user import User
from app.models.heritage import HeritageSite, Story, HeritageMedia
from app.models.knowledge import KnowledgeNode, KnowledgeEdge
from app.core.security import get_password_hash

ARTIFACT_SITES = [
    {
        "name": "Kathmandu Valley UNESCO World Heritage Site",
        "category": "monument",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Kathmandu Valley - Inscribed World Heritage (1979)",
            "content": "Inscribed as UNESCO World Heritage in 1979, Kathmandu Valley contains seven groups of monuments including Durbar Squares of Kathmandu, Patan, and Bhaktapur, as well as Swayambhunath, Pashupatinath, Bauddhanath, and Changu Narayan. Represents the high cultural synthesis of Newar architecture, Hinduism, and Buddhism."
        },
        "media": [
            {"media_url": "/hero_heritage_nepal.png", "media_type": "image"}
        ]
    },
    {
        "name": "Lumbini Sacred Garden & Maya Devi Temple",
        "category": "monument",
        "latitude": 27.48,
        "longitude": 83.28,
        "story": {
            "language": "en",
            "title": "Lumbini - Birthplace of Lord Buddha",
            "content": "Inscribed as UNESCO World Heritage in 1997. Lumbini is the sacred birthplace of Siddhārtha Gautama (Lord Buddha) in 623 BC. Features the Ashoka Pillar erected by Emperor Ashoka in 249 BC, ancient monasteries, and the holy Puskarini pond."
        },
        "media": [
            {"media_url": "/hero_heritage_nepal.png", "media_type": "image"}
        ]
    },
    {
        "name": "Panauti Early Medieval Heritage Complex",
        "category": "monument",
        "latitude": 27.58,
        "longitude": 85.52,
        "story": {
            "language": "en",
            "title": "Panauti - Medieval Newar Confluence Settlement",
            "content": "On UNESCO Tentative list since 1996. Located at the sacred confluence of Roshi and Punyamati rivers. Known for Indreshwar Mahadev Temple (one of the oldest surviving pagoda temples in Nepal built in 1294 AD) and preserved wooden carved architecture."
        }
    },
    {
        "name": "Tilaurakot Ancient Shakya Kingdom",
        "category": "history",
        "latitude": 27.57,
        "longitude": 83.05,
        "story": {
            "language": "en",
            "title": "Tilaurakot - Capital of Ancient Kapilavastu",
            "content": "UNESCO Tentative list (1996). Archaeological site identifying the ancient city of Kapilavastu where Prince Siddhartha Gautama spent his first 29 years before embarking on his spiritual journey."
        }
    },
    {
        "name": "Muktinath Valley Cave Architecture",
        "category": "architecture",
        "latitude": 28.82,
        "longitude": 83.87,
        "story": {
            "language": "en",
            "title": "Muktinath - High Himalayan Cave & Pilgrimage Site",
            "content": "UNESCO Tentative list (1996). Sacred to both Hindus (as Muktikshetra) and Buddhists (as Chumig Gyatsa). Features 108 sacred water spouts, eternal flame fueled by natural gas, and ancient cliff cave dwellings in Mustang."
        }
    },
    {
        "name": "Gorkha Medieval Palace Complex",
        "category": "architecture",
        "latitude": 28.00,
        "longitude": 84.63,
        "story": {
            "language": "en",
            "title": "Gorkha Durbar - Birthplace of Modern Nepal",
            "content": "UNESCO Tentative list (1996). Perched atop a steep hill overlooking the Himalayas, Gorkha Durbar was built in the 16th century by King Ram Shah. Birthplace of King Prithvi Narayan Shah, founder of modern unified Nepal."
        }
    },
    {
        "name": "Ramagrama Relic Stupa",
        "category": "monument",
        "latitude": 27.53,
        "longitude": 83.67,
        "story": {
            "language": "en",
            "title": "Ramagrama - The Intact Buddha Relic Stupa",
            "content": "UNESCO Tentative list (1996). The only original stupa containing untouched bodily relics of Lord Buddha, protected according to tradition by a serpent king (Naga) when Emperor Ashoka collected relics elsewhere."
        }
    },
    {
        "name": "Khokana Traditional Mustard-Oil Village",
        "category": "tradition",
        "latitude": 27.65,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Khokana - Living Heritage of Newar Agriculture & Oil Milling",
            "content": "UNESCO Tentative list (1996). Famous for traditional heavy wooden mustard-oil presses, Rudrayani Temple, unique harvest rituals, and non-observance of Dashain in favor of local Shikali festival."
        }
    },
    {
        "name": "Lo Manthang Walled City",
        "category": "history",
        "latitude": 29.18,
        "longitude": 83.97,
        "story": {
            "language": "en",
            "title": "Lo Manthang - Capital of the Ancient Kingdom of Lo",
            "content": "UNESCO Tentative list (2008). Founded in 1380 by Ame Pal. Walled medieval city in Upper Mustang preserving Tibetan Buddhist culture, 15th-century monasteries (Thubchen, Jampa), and intact palace architecture."
        }
    },
    {
        "name": "Vajrayogini Temple & Ancient Sankhu",
        "category": "temple",
        "latitude": 27.73,
        "longitude": 85.45,
        "story": {
            "language": "en",
            "title": "Sankhu & Vajrayogini Shrine",
            "content": "UNESCO Tentative list (2008). Ancient trade route town on the way to Tibet. The multi-tiered Vajrayogini Temple is one of the most sacred Tantric centers for both Newar Buddhists and Hindus."
        }
    },
    {
        "name": "Swayambhunath Stupa (Monkey Temple)",
        "category": "temple",
        "latitude": 27.71,
        "longitude": 85.29,
        "story": {
            "language": "en",
            "title": "Swayambhunath - Mythological Origin Stupa of Kathmandu",
            "content": "Swayambhu Purana states that Kathmandu Valley was a lake, from which a lotus bloomed containing Swayambhu (self-existent light). Bodhisattva Manjusri cut the gorge at Chobhar with his sword to drain the lake, establishing Swayambhunath atop the hill."
        }
    },
    {
        "name": "Pashupatinath Temple",
        "category": "temple",
        "latitude": 27.71,
        "longitude": 85.35,
        "story": {
            "language": "en",
            "title": "Pashupatinath - Sacred Guardian Temple of Nepal",
            "content": "Located on the banks of the Bagmati River. Sacred Hindu temple dedicated to Lord Shiva as Pashupati (Lord of Animals). Features two-tiered pagoda architecture, silver embossed doors, and sacred cremation ghats."
        }
    },
    {
        "name": "Changu Narayan Temple",
        "category": "temple",
        "latitude": 27.73,
        "longitude": 85.42,
        "story": {
            "language": "en",
            "title": "Changu Narayan - Oldest Inscribed Temple in Nepal",
            "content": "Perched on a hilltop in Bhaktapur. Contains the stone pillar inscription of King Manadeva I (464 AD), the earliest dated inscription in Nepal. Dedicated to Lord Vishnu and maintained by Rajopadhyaya priests."
        }
    },
    {
        "name": "Taleju Bhawani Temple",
        "category": "temple",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Taleju Bhawani - Tutelary Goddess of Malla Kings",
            "content": "Built by King Mahendra Malla in 1549 AD at Kathmandu Durbar Square. Dedicated to goddess Taleju Bhawani, royal deity of Malla kings. Opened to the general public only once a year during Dashain/Mohani."
        }
    },
    {
        "name": "Kumbheshwar Temple Patan",
        "category": "temple",
        "latitude": 27.67,
        "longitude": 85.32,
        "story": {
            "language": "en",
            "title": "Kumbheshwar - Five-Tiered Pagoda of Lalitpur",
            "content": "Built in 1392 AD. One of only two five-roofed pagoda temples in the Kathmandu Valley. Associated with the sacred water pool believed to feed directly from Gosaikunda alpine lake."
        }
    },
    {
        "name": "Dattatreya Temple & Peacock Window",
        "category": "temple",
        "latitude": 27.67,
        "longitude": 85.43,
        "story": {
            "language": "en",
            "title": "Dattatreya Square & Newar Woodcarving Legacy",
            "content": "Built in 1427 AD during King Yaksha Malla's reign from a single tree trunk. Dedicated to Dattatreya (trimurti of Brahma, Vishnu, Shiva). Nearby Pujari Math features the famous 15th-century Peacock Window."
        },
        "media": [
            {"media_url": "/traditional_pottery_craft.png", "media_type": "image"}
        ]
    },
    {
        "name": "Ashoka Stupas of Patan",
        "category": "monument",
        "latitude": 27.67,
        "longitude": 85.32,
        "story": {
            "language": "en",
            "title": "The Four Cardinal Stupas of Lalitpur",
            "content": "Four ancient mound stupas located at the four cardinal boundaries of Patan (Lagankhel, Teta, Ebahi, Pulchowk), historically attributed to Indian Emperor Ashoka's visit in the 3rd century BC."
        }
    },
    {
        "name": "Kathmandu Durbar Square (Hanuman Dhoka)",
        "category": "monument",
        "latitude": 27.70,
        "longitude": 85.31,
        "story": {
            "language": "en",
            "title": "Hanuman Dhoka Palace Complex",
            "content": "Historic royal palace of Malla and Shah kings. Features Hanuman statue at entrance gate, Nine-Storey Palace (Nautalle Durbar), Kasthamandap pavilion, and the Kumari Ghar (Palace of the Living Goddess)."
        }
    },
    {
        "name": "Patan Durbar Square",
        "category": "monument",
        "latitude": 27.67,
        "longitude": 85.32,
        "story": {
            "language": "en",
            "title": "Patan Durbar - Masterpiece of Newar Architecture",
            "content": "Heart of Lalitpur city. Renowned for Krishna Mandir (shikhara style stone temple built in 1637 by King Siddhi Narsingh Malla), Patan Museum, Sundari Chowk, and golden spout Tusha Hiti."
        }
    },
    {
        "name": "Bhaktapur Durbar Square",
        "category": "monument",
        "latitude": 27.67,
        "longitude": 85.43,
        "story": {
            "language": "en",
            "title": "Bhaktapur - City of Devotees & 55-Window Palace",
            "content": "Former capital of Malla Kingdom until 1482. Features 55-Window Palace (Pachpanna Jhyale Durbar built by King Bhupatindra Malla), Golden Gate (Lu Dhowka), Nyatapola five-storey temple, and Pottery Square."
        }
    },
    {
        "name": "Dhunge Dhara (Hiti) Stone Water Systems",
        "category": "water",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Dhunge Dhara - Ancient Newar Hydraulic Engineering",
            "content": "Subterranean gravity-fed water supply system featuring intricate carved stone spouts (hiti), filtration basins, underground canals (raj kulo), and ponds. Crucial to urban civic, ritual, and domestic life."
        }
    },
    {
        "name": "Gosaikunda Sacred Alpine Lake",
        "category": "water",
        "latitude": 28.07,
        "longitude": 85.42,
        "story": {
            "language": "en",
            "title": "Gosaikunda - Alpine Lake of Lord Shiva & Silu Folk Memory",
            "content": "High-altitude freshwater lake at 4,380 m in Langtang National Park. Legend says Lord Shiva thrust his trident to create the lake and drink water to cool his throat after swallowing poison. Subject of the tragic Newar folk ballad Silu."
        },
        "media": [
            {"media_url": "/static/audio/silu.wav", "media_type": "audio"}
        ]
    },
    {
        "name": "Janakpurdham & Janaki Mandir",
        "category": "temple",
        "latitude": 26.73,
        "longitude": 85.93,
        "story": {
            "language": "en",
            "title": "Janakpurdham - Cultural Heart of Mithila",
            "content": "Capital of ancient Videha Kingdom ruled by King Janaka. Birthplace of Sita (Goddess Janaki). The grand Janaki Mandir, built in 1911 by Queen Vrishabhanu of Tikamgarh in Rajput-Mughal style, features 60 rooms and brilliant white marble facade."
        },
        "media": [
            {"media_url": "/janaki_mandir_janakpur.png", "media_type": "image"}
        ]
    },
    {
        "name": "Tengboche Monastery",
        "category": "temple",
        "latitude": 27.84,
        "longitude": 86.76,
        "story": {
            "language": "en",
            "title": "Tengboche Gompa - Spiritual Heart of Solukhumbu Sherpas",
            "content": "Founded in 1916 by Lama Gulu. Leading Nyingma Tibetan Buddhist monastery in Khumbu region. Frames panoramic views of Ama Dablam and Mount Everest. Host site of the annual Mani Rimdu sacred mask dance festival."
        }
    },
    {
        "name": "Chomolungma (Mount Everest)",
        "category": "natural",
        "latitude": 27.98,
        "longitude": 86.93,
        "story": {
            "language": "en",
            "title": "Chomolungma - Mother Goddess of the World",
            "content": "World's highest peak (8,848.86 m). Replicated in Sherpa oral tradition as sacred home of Miyolangsangma, goddess of nourishment. Climbers perform Lhabso ritual for protection prior to ascents."
        }
    },
    {
        "name": "Yenya (Indra Jatra) Festival",
        "category": "festival",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Yenya / Indra Jatra - Largest Street Festival of Kathmandu",
            "content": "Celebrates the god of rain, Indra. Features chariot procession of the Living Goddess Kumari, Lord Ganesh, and Lord Bhairav, raising of Yosin pole, and Lakhey masked dances through Kathmandu street squares."
        },
        "media": [
            {"media_url": "/static/audio/wala_wala.wav", "media_type": "audio"}
        ]
    },
    {
        "name": "Mohani & Malshree Music Tradition",
        "category": "festival",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Mohani Festival & Classical Malshree Dhun",
            "content": "Newar celebration of Dashain marked by family feasts, Payaa sword processions, and recitals of classical Malshree Dhun devotional music announcing the autumn season."
        },
        "media": [
            {"media_url": "/static/audio/malshree_dhun.wav", "media_type": "audio"},
            {"media_url": "/static/audio/mohani.wav", "media_type": "audio"}
        ]
    },
    {
        "name": "Rato Machhindranath (Bunga Dyah) Jatra",
        "category": "festival",
        "latitude": 27.67,
        "longitude": 85.32,
        "story": {
            "language": "en",
            "title": "Bunga Dyah Jatra - Longest Chariot Procession of Nepal",
            "content": "Month-long festival in Patan pulling a massive 60-foot wooden chariot of Karunamaya/Rato Machhindranath. Concludes with Bhoto Jatra, the ceremonial display of the jewel-studded vest."
        }
    },
    {
        "name": "Biska Jatra of Bhaktapur",
        "category": "festival",
        "latitude": 27.67,
        "longitude": 85.43,
        "story": {
            "language": "en",
            "title": "Biska Jatra - New Year Chariot Festival of Bhaktapur",
            "content": "Celebrated during Nepalese New Year (mid-April). Involves pulling massive chariots of Bhairab and Bhadrakali, erect erection of a 55-foot Yohsi pole, and tongue-piercing ceremony in Thimi."
        }
    },
    {
        "name": "Gunla Bajan & Sacred Newar Music",
        "category": "tradition",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Gunla Month Sacred Musical Parades",
            "content": "During the holy Gunla month of the Nepal Sambat calendar, musical bands perform traditional Gunla Bajan hymns while making early morning pilgrimages to Swayambhunath and shrines."
        },
        "media": [
            {"media_url": "/static/audio/gunla_bajan.wav", "media_type": "audio"},
            {"media_url": "/static/audio/dapha_bhajan.wav", "media_type": "audio"}
        ]
    },
    {
        "name": "Rajamati & Newar Heritage Folk Ballads",
        "category": "tradition",
        "latitude": 27.70,
        "longitude": 85.30,
        "story": {
            "language": "en",
            "title": "Rajamati, Sitala Maju & Newar Folk Song Archive",
            "content": "Rajamati is the famous Newar folk song recorded in Kolkata in 1908 by Seturam Shrestha. Sitala Maju recounts the 19th-century tragedy of children expelled from Kathmandu during smallpox epidemics."
        },
        "media": [
            {"media_url": "/static/audio/rajamati.wav", "media_type": "audio"},
            {"media_url": "/static/audio/sitala_maju.wav", "media_type": "audio"},
            {"media_url": "/static/audio/ji_waya_la.wav", "media_type": "audio"}
        ]
    },
    {
        "name": "Mithila Painting & Madhubani Art Archive",
        "category": "tradition",
        "latitude": 26.70,
        "longitude": 86.10,
        "story": {
            "language": "en",
            "title": "Mithila Folk Painting & Wall Art Traditions",
            "content": "Ancient wall and floor painting tradition practiced by women of Mithila. Uses natural dyes, geometric patterns, and scenes from epic mythology, weddings, and natural flora."
        },
        "media": [
            {"media_url": "/mithila_cultural_art.png", "media_type": "image"}
        ]
    },
    {
        "name": "Vidyapati & Maithili Literary Heritage",
        "category": "history",
        "latitude": 26.70,
        "longitude": 86.10,
        "story": {
            "language": "en",
            "title": "Poet Vidyapati & The Tirhuta Script Legacy",
            "content": "Vidyapati Thakur (1360-1450) composed over 1,000 immortal songs in Maithili language using Tirhuta (Mithilakshara) script. Jyotirishwar Thakur wrote Varna Ratnakara (~1327 AD), the earliest known prose work in Maithili."
        }
    },
    {
        "name": "Mani Rimdu Festival Solukhumbu",
        "category": "festival",
        "latitude": 27.84,
        "longitude": 86.76,
        "story": {
            "language": "en",
            "title": "Mani Rimdu - Sherpa Sacred Masked Dance",
            "content": "19-day autumn festival held at Tengboche Monastery. Monks wear elaborate sacred masks representing Buddhist protector deities, performing dances (Chham) to conquer negative forces and bring peace."
        }
    }
]

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("Checking default admin user...")
        res = await session.execute(select(User).where(User.email == "admin@heritage.np"))
        admin = res.scalar_one_or_none()
        if not admin:
            admin = User(
                username="admin",
                email="admin@heritage.np",
                hashed_password=get_password_hash("AdminPass123!"),
                role="admin",
                reputation_score=100
            )
            session.add(admin)
            await session.flush()
            print(f"Created admin user: {admin.email} (ID: {admin.id})")
        else:
            print(f"Existing admin user: {admin.email} (ID: {admin.id})")

        print("Seeding heritage sites, stories, and media...")
        for item in ARTIFACT_SITES:
            res_site = await session.execute(select(HeritageSite).where(HeritageSite.name == item["name"]))
            existing_site = res_site.scalar_one_or_none()
            if not existing_site:
                site = HeritageSite(
                    name=item["name"],
                    category=item["category"],
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    status="approved",
                    creator_id=admin.id
                )
                session.add(site)
                await session.flush()

                # Add story
                st = item["story"]
                story = Story(
                    site_id=site.id,
                    language=st["language"],
                    title=st["title"],
                    content=st["content"],
                    contributor_id=admin.id,
                    is_translation=False,
                    translation_method="original",
                    translation_status="approved"
                )
                session.add(story)

                # Add media if any
                media_items = item.get("media")
                if isinstance(media_items, list):
                    for m in media_items:
                        media_rec = HeritageMedia(
                            site_id=site.id,
                            media_url=str(m["media_url"]),
                            media_type=str(m["media_type"]),
                            contributor_id=admin.id
                        )
                        session.add(media_rec)

                print(f"  [+] Ingested site: {site.name} ({site.category})")
            else:
                print(f"  [=] Site already exists: {existing_site.name}")

        await session.commit()
        print("Heritage sites seeding completed successfully.")

        # Seed Knowledge Graph Nodes & Edges
        print("Seeding Knowledge Graph nodes and edges...")
        nodes_data = [
            {"name": "Newar Culture", "type": "community", "description": "Indigenous cultural heritage of Kathmandu Valley"},
            {"name": "Maithil Culture", "type": "community", "description": "Cultural tradition of Mithila region in Madhesh Province"},
            {"name": "Sherpa Culture", "type": "community", "description": "Himalayan Buddhist tradition of Solukhumbu"},
            {"name": "Kirat Dynasty", "type": "tradition", "description": "Earliest recorded rulers of Kathmandu Valley"},
            {"name": "Malla Dynasty", "type": "tradition", "description": "Medieval golden age of Newar arts & architecture"},
            {"name": "Kathmandu Valley WHS", "type": "site", "description": "UNESCO World Heritage monument zone"},
            {"name": "Janakpurdham", "type": "site", "description": "Mithila cultural center and Janaki Mandir"},
            {"name": "Solukhumbu Monasteries", "type": "site", "description": "Sherpa Nyingma Buddhist monastery cluster"},
        ]

        node_map = {}
        for nd in nodes_data:
            r = await session.execute(select(KnowledgeNode).where(KnowledgeNode.name == nd["name"]))
            knode = r.scalar_one_or_none()
            if not knode:
                knode = KnowledgeNode(name=nd["name"], type=nd["type"], description=nd["description"])
                session.add(knode)
                await session.flush()
            node_map[nd["name"]] = knode.id

        edges_data = [
            {"source": "Kathmandu Valley WHS", "target": "Newar Culture", "type": "practiced_by"},
            {"source": "Kathmandu Valley WHS", "target": "Malla Dynasty", "type": "built_by"},
            {"source": "Janakpurdham", "target": "Maithil Culture", "type": "practiced_by"},
            {"source": "Solukhumbu Monasteries", "target": "Sherpa Culture", "type": "practiced_by"},
        ]

        for ed in edges_data:
            s_id = node_map.get(ed["source"])
            t_id = node_map.get(ed["target"])
            if s_id and t_id:
                r_edge = await session.execute(
                    select(KnowledgeEdge).where(
                        KnowledgeEdge.source_node_id == s_id,
                        KnowledgeEdge.target_node_id == t_id,
                        KnowledgeEdge.relationship_type == ed["type"]
                    )
                )
                if not r_edge.scalar_one_or_none():
                    edge = KnowledgeEdge(source_node_id=s_id, target_node_id=t_id, relationship_type=ed["type"])
                    session.add(edge)

        await session.commit()
        print("Knowledge graph seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
