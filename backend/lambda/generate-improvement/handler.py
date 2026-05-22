import json
import os
import boto3
from datetime import datetime, timezone

bedrock = boto3.client("bedrock-runtime")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

DAILY_LIMIT = int(os.environ["DAILY_LIMIT"])
MODEL_ID = os.environ["BEDROCK_MODEL_ID"]

SYSTEM_PROMPT = """You are an expert assistant that improves UK Apprentice training log entries.

Your task is to rewrite the provided text with enhanced professional language while maintaining the apprentice's voice.

Some inputs may contain no existing text for the field, it may be empty, in this case you should generate the field based on the rest of the full log

IMPORTANT:
- Return ONLY the improved text (2-4 complete sentences or around 75-100 words)
- Maintain the original meaning and intent
- Use professional language suitable for UK apprenticeship documentation
- Focus on skills gained and workplace relevance
- Do NOT include any labels, formatting, or explanatory text"""


def check_and_increment(user_id: str, today: str) -> bool:
    now = datetime.now(timezone.utc).isoformat()
    try:
        table.update_item(
            Key={"PK": f"USER#{user_id}", "SK": f"USAGE#{today}"},
            UpdateExpression="SET #c = if_not_exists(#c, :zero) + :one, lastUpdated = :now, dailyLimit = if_not_exists(dailyLimit, :limit), userId = :uid, #d = :date",
            ConditionExpression="attribute_not_exists(#c) OR #c < :limit",
            ExpressionAttributeNames={"#c": "count", "#d": "date"},
            ExpressionAttributeValues={
                ":zero": 0,
                ":one": 1,
                ":now": now,
                ":limit": DAILY_LIMIT,
                ":uid": user_id,
                ":date": today,
            },
        )
        return True
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return False


def invoke_bedrock(current_content: str, field_name: str, full_context: dict) -> str:
    user_message = f"Field: {field_name}\nCurrent content: {current_content or '(empty)'}\nFull log context: {json.dumps(full_context or {})}"
    body = json.dumps({
        "messages": [{"role": "user", "content": [{"text": user_message}]}],
        "system": [{"text": SYSTEM_PROMPT}],
        "inferenceConfig": {"maxTokens": 300, "temperature": 0.7},
    })
    response = bedrock.invoke_model(modelId=MODEL_ID, body=body, contentType="application/json")
    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]


def lambda_handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("username")
    if not user_id:
        raise Exception("Unauthorized")

    arguments = event.get("arguments", {})
    current_content = arguments.get("currentFieldContent", "")
    field_name = arguments.get("fieldName", "")
    full_context = arguments.get("fullLogContext")
    if isinstance(full_context, str):
        full_context = json.loads(full_context)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if not check_and_increment(user_id, today):
        raise Exception("Daily AI usage limit reached")

    return invoke_bedrock(current_content, field_name, full_context)
