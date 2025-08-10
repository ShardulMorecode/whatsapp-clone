import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "whatsapp"

# Create MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# Our main collection
processed_messages = db["processed_messages"]
