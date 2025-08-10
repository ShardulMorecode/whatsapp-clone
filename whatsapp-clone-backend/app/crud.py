from .db import processed_messages

def get_all_conversations():
    return list(processed_messages.find({}))

def get_conversation_by_wa_id(wa_id):
    return list(processed_messages.find({"wa_id": wa_id}))
