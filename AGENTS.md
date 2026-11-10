# 本站局部视觉约定

- 导航与选中态不用侧边色条、inset 色带或伪元素条；当前位置以文字颜色/字重表达。
- 键盘焦点保留完整可见轮廓（`:focus-visible`）。

# 工程产物约定

- 截图、调试日志、一次性检查脚本只放 `target/.tmp/<任务名>/`，任务结束即清理；确需保留的最终验收图只放 `target/reports/`；正式构建产物只进 `dist/`。
- 禁止在仓库根目录散落 `target-*.png`/`*.log`、`nul` 等临时文件；开发服务日志放 `target/dev/`，不落根目录。
- `TEMP`/`TMP`/`TMPDIR` 指向本项目 `target/tmp`，不用系统 Temp；编译缓存放 `target/tmp/node-compile-cache`。
- 删除文件/目录一律走 `E:\tools\Remove-Directory.ps1`，不用 Remove-Item/del/rd。

# 文档内容约定

- 正文直接说明操作与必要规则，禁止用自问自答凑 FAQ，也禁止跨页重复解释同一件事。
- 故障排查页只保留有实际处理步骤的内容。
