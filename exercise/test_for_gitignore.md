# 忽略所有以 .log 结尾的文件
*.log

# 忽略 build 目录及其内容
build/

# 忽略 dist 目录下的所有内容，但保留 dist 目录本身（如果它不存在，Git 依然不会跟踪）
# 通常用于编译输出目录
/dist/

# 忽略 node_modules 目录及其内容
node_modules/

如果 .idea 已经被 Git 跟踪了：
如果你的 .idea 目录在之前不小心被添加到了 Git 仓库中（例如，你运行过 git add . 后又提交了），
那么简单地在 .gitignore 中添加规则是无效的。
你需要先将其从 Git 的跟踪中移除，但保留本地文件。
git rm -r --cached .idea/ # 从 Git 索引中移除 .idea 目录，但保留本地文件
git add .gitignore        # 将修改后的 .gitignore 文件添加到暂存区
git commit -m "Add .idea/ to .gitignore and untrack it" # 提交更改




















# 忽略特定文件
mysecret.txt

# 忽略所有的 .DS_Store 文件 (macOS)
.DS_Store

# 忽略所有的 .pyc 文件 (Python)
*.pyc

# 忽略所有在 lib/ 目录下的 .tmp 文件，但如果你想忽略所有 .tmp 文件，可以直接写 *.tmp
/lib/*.tmp

# 忽略 bin/ 目录下所有文件，但除了 bin/keep.txt
/bin/*
!/bin/keep.txt

# 忽略 workspace/ 目录下的所有文件，但如果你想包含 workspace/important.txt
# 注意：一个文件如果已经被上级目录规则忽略，则无法通过子规则再次包含。
# 比如，如果 /workspace/ 已经被忽略，那么 /workspace/important.txt 也会被忽略。
# 要使其生效，!规则必须是忽略规则的子集，且父目录没有被完全忽略。
# 更安全的做法是避免完全忽略一个目录，而是忽略其内容，然后包含特定文件。
# 例如：
# /workspace/*
# !/workspace/important.txt

# 忽略 .env 文件（常用于环境变量配置）
.env

# 忽略所有名称为 temp 的文件或目录，无论它们在哪里
temp