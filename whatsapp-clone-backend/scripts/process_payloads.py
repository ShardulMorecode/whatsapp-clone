import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "whatsapp"
COLLECTION_NAME = "processed_messages"

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

PAYLOADS_DIR = r"C:\Users\Admin\OneDrive\Desktop\my projects\Whatsapp_Clone\whatsapp-clone-backend\scripts\payloads"  # Update path

def process_payload(payload):
    try:
        value = payload["metaData"]["entry"][0]["changes"][0]["value"]

        if "messages" in value:
            # This is a new message
            message = value["messages"][0]
            contact = value["contacts"][0]

            doc = {
                "wa_id": contact["wa_id"],
                "name": contact["profile"]["name"],
                "from": message["from"],
                "message_id": message["id"],
                "timestamp": message["timestamp"],
                "text": message["text"]["body"],
                "status": "sent"
            }
            collection.update_one({"message_id": doc["message_id"]}, {"$set": doc}, upsert=True)

        elif "statuses" in value:
            # This is a status update
            status_info = value["statuses"][0]
            collection.update_one(
                {"message_id": status_info["id"]},
                {"$set": {"status": status_info["status"]}}
            )

    except Exception as e:
        print(f"Error processing payload: {e}")

def main():
    for file_name in os.listdir(PAYLOADS_DIR):
        if file_name.endswith(".json"):
            with open(os.path.join(PAYLOADS_DIR, file_name), "r", encoding="utf-8") as f:
                payload = json.load(f)
                process_payload(payload)
    print("Payload processing complete.")

if __name__ == "__main__":
    main()
