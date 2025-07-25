from requirements import scrape_usa
import json

if __name__ == "__main__":
    result = scrape_usa()
    print(json.dumps(result, indent=2))