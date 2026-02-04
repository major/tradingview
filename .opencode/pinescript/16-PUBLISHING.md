# Script Publishing

TradingView hosts a global community of millions of traders. Publishing your Pine Script™ indicators, strategies, and libraries allows you to share your tools, build a reputation, and contribute to the ecosystem. 🚀🚀

## Privacy Types

When publishing, you must choose between **Public** or **Private** privacy. This setting **cannot** be changed after publication. 🔒🔓

| Type | Visibility | Discoverability | Best For |
|------|------------|-----------------|----------|
| **Public** | Everyone | Community Scripts feed, Search, Profile | Final releases, building reputation |
| **Private** | URL only | Hidden from feed and search | Testing, drafts, collaborating with friends |

> [!IMPORTANT]
> Public scripts have a **15-minute edit window**. After 15 minutes, the title and description become permanent. Use private scripts as drafts to verify everything before going public! ⏱️⚠️

## Visibility Types

Visibility determines who can see your source code and who can use the script. 👁️💻

### 1. Open-Source (Open) 🔓
*   **Code**: Full source code is visible to everyone.
*   **License**: Defaults to **Mozilla Public License 2.0 (MPL 2.0)**.
*   **Benefits**: Eligible for **Editors' Picks**, allows others to learn and build upon your work.
*   **Requirement**: Reused code must credit the original author and remain open-source.

### 2. Protected 🛡️
*   **Code**: Source code is hidden from everyone except the author.
*   **Usage**: Anyone can add it to their chart and use it for free.
*   **Requirement**: Requires a paid TradingView plan. Description must explain the script's unique qualities.

### 3. Invite-Only 🎟️
*   **Code**: Source code is hidden.
*   **Usage**: Only users explicitly invited by the author can use it.
*   **Requirement**: Requires **Premium** or higher plan.
*   **Vendors**: Authors of public invite-only scripts are considered vendors and must follow strict requirements.

## Publishing Process

### Requirements for Publishing 📋
*   **Originality**: Scripts must provide unique value. Avoid "copy-pasting" or minor tweaks to existing scripts.
*   **No Lookahead Bias**: Ensure `request.security()` calls don't use future data on historical bars.
*   **Performance**: Use the **Pine Profiler** to ensure your script doesn't consume excessive resources.
*   **Documentation**: A clear, English-first description explaining what the script does and how to use it.

### How to Publish 🚀
1.  Open your script in the **Pine Editor**.
2.  Click the **Publish Script** button (top-right).
3.  **Page 1**: Enter a meaningful **Title** and a detailed **Description** (use markup tags like `[b]`, `[pine]`, `[list]`).
4.  **Page 2**: Select **Privacy** (Public/Private) and **Visibility** (Open/Protected/Invite-only).
5.  Add **Category** tags and custom keywords.
6.  Click **Publish**.

### Updating Scripts 🔄
*   Select **Update existing script** in the Publish window.
*   Provide **Release Notes** explaining the changes.
*   Use the **Difference Checker** to verify code changes before finalizing.
*   Release notes are finalized **immediately** upon publication.

### Closed-Source Considerations 🔒
*   **Unique Logic**: Closed-source (Protected/Invite-only) is for scripts with unique logic. Reproducing open-source behavior in a closed-source script is generally not allowed.
*   **Trust**: Since users cannot see the code, the description must provide enough detail to build trust and explain why the code needs protection.
*   **Obfuscation**: While the source is hidden, the script must still be functional and not intentionally misleading.

## Rules and Guidelines ⚖️

### House Rules & Script Rules
*   **No Advertising**: Do not include links to social media, websites, or telegram in the description or script visuals (except for Invite-only vendor instructions).
*   **English First**: Descriptions must start with English.
*   **Substantiated Claims**: Do not claim "90% win rate" or "guaranteed profits".
*   **Clean Charts**: Published charts should only show the script being demonstrated. Remove unnecessary drawings or other indicators.

### Vendor Requirements (Invite-Only) 💰
*   **Account Age**: Minimum **3 months** of account age.
*   **Reputation**: Minimum **1000 reputation points** (recommended for trust).
*   **Payment**: All transactions must happen **off-platform**. TradingView does not handle payments or take a cut.
*   **Instructions**: Must provide clear instructions on how users can request access.

## Post-Publication 📢

### Moderation Process
*   **Script Moderators** review public publications for compliance.
*   **Hidden Scripts**: If a script violates rules, it will be hidden from the public feed. You will receive a message from moderators explaining why.
*   **Corrections**: To fix a hidden script, you must publish a **new** compliant version.

### Editors' Picks 🏆
The TradingView team manually selects exceptional scripts to feature.
*   **Criteria**: Originality, high utility, excellent documentation, and clean code.
*   **Eligibility**: Must be **Public** and **Open-Source**.

## Quick Reference ⚡

| Scenario | Recommended Settings |
|----------|----------------------|
| **Testing a new idea** | Private + Open-Source |
| **Sharing a free tool** | Public + Open-Source |
| **Protecting proprietary logic** | Public + Protected |
| **Selling a commercial tool** | Public + Invite-Only |
| **Collaborating with a team** | Private + Invite-Only |

> [!TIP]
> **MPL 2.0 License**: Allows others to use and modify your code, but they must credit you and keep their derivative works open-source under the same license. 📜🤝
