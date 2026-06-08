#!/bin/bash
set -euo pipefail

# TCE 启动脚本：启动 Go 后端二进制。
# 二进制与本脚本在同一部署目录下（由 build.sh 一起打进产物 output/）。
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# TCE 默认对外端口；如平台分配了其它端口，会通过环境变量 PORT 覆盖。
export PORT="${PORT:-3000}"

exec "$DIR/turing-arena-backend"
