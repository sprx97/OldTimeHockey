import sys
from pathlib import Path

_CONFIG_ROOT = Path("/home/jeremy/oth-shared")
if str(_CONFIG_ROOT) not in sys.path:
    sys.path.insert(0, str(_CONFIG_ROOT))
import Config
