import os
import sys
import logging

# Define log format
LOG_FORMAT = "[%(asctime)s: %(levelname)s: %(module)s: %(message)s]"

# Define log directory and file
LOG_DIR = "logs"
LOG_FILE = "running_logs.log"
LOG_PATH = os.path.join(LOG_DIR, LOG_FILE)

# Ensure the log directory exists
os.makedirs(LOG_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler(sys.stdout)
    ]
)

# Logger instance
logger = logging.getLogger("cnnClassifierLogger")
