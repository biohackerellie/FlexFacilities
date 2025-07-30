import re

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    snake = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    return snake

def process_sql(sql):
    def replace_identifier(match):
        old = match.group(1)
        new = camel_to_snake(old)
        if old != new:
            print(f"Converted: {old} → {new}")  # Debug logging!
        return new
    # Replace all double-quoted identifiers
    return re.sub(r'"([^"]+)"', replace_identifier, sql)

with open("dump.sql") as f:
    text = f.read()

result = process_sql(text)

with open("output.sql", "w") as f:
    f.write(result)
