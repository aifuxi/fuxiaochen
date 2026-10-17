# 前台预览图片生成记录

生成方式：内置 `image_gen.imagegen`，分别生成两张独立图片；未使用 CLI/API 兜底。原图经项目已安装的 sharp 仅缩放至 1200px 宽并转换为 WebP（quality 83）。两张图片均用于本地 HTML 预览，不能被解释为真实桌面的摄影记录。

## 首页写作主题图

文件：`writing-hero.webp`。用途：首页右侧写作视觉。

```text
Use case: photorealistic-natural
Asset type: personal developer blog homepage editorial photograph, landscape 4:3 aspect ratio.
Primary request: a quiet, precise writing desk photograph with a partial compact aluminum keyboard, an open white notebook and one blue pencil.
Scene/backdrop: a seamless cool gray desk, reserved and modern, viewed from a near top-down 35-degree angle.
Subject: notebook on the lower-right to center with completely blank white pages, blue pencil resting diagonally along its outer edge; cropped silver aluminum keyboard visible near upper-left, natural and believable.
Style/medium: high-end editorial still life photography, real material textures, subtle fine paper grain, brushed aluminum, physically plausible shadows, understated.
Composition/framing: horizontal 4:3 image; carefully spaced objects with generous cool gray negative space; notebook and keyboard feel like the desk of someone who writes and builds software, no screen or digital UI.
Lighting/mood: large soft side window light from left, clear delicate shadows, calm focus, contemporary magazine photographic quality.
Color palette: cold neutral gray, white paper, silver aluminum, a single restrained blue pencil accent close to #54A9FF / #0064FA. Neutral shadows that complement #16161A dark website and white light mode.
Constraints: no person, no hands, no text anywhere, no letters on keyboard keycaps, no logos, no watermark, no labels, no screen, no purple light, no warm beige or yellow light, no gradients or decorative graphic overlays. Avoid CGI or illustration.
```

## 示例文章插图

文件：`article-illustration.webp`。用途：文章详情示例插图。

```text
Use case: photorealistic-natural
Asset type: personal developer blog article illustration, landscape 3:2 aspect ratio.
Primary request: refined editorial still life photograph about organizing writing clearly, made only of white paper sheets with deliberate folds and a few fine blue ink guide lines, on a cool medium gray writing desk.
Subject: a small arranged stack of bright white unprinted papers, one top sheet gently folded back at a corner, two partially offset sheets beneath; a few sparse straight thin blue lines drawn on the blank upper sheet to suggest an outline being organized. Lines only, no text, letters, digits, symbols, or diagrams. One restrained blue wooden pencil at the far edge can be partially visible.
Style/medium: premium realistic editorial photography, authentic paper fibers, clean crisp folds, a thoughtfully arranged but unpretentious working desktop, understated technical blog art direction.
Composition/framing: horizontal 3:2; near overhead shot, central asymmetric arrangement with ample breathing room around paper; realistic scale, calm negative space.
Lighting/mood: soft cool daylight from the left, delicate cast shadows revealing paper layers and edges, serene clarity.
Color palette: cool gray background, off-white paper, minimal single blue accent close to #54A9FF / #0064FA; neutral cold shadows suited to #16161A dark website and white light mode.
Constraints: no other objects, no hands, no people, no plants, no laptop, no screen, no digital UI, no logos, no text, no watermark, no purple, no warm yellow or beige lighting, no decorative graphic overlays, no illustration or CGI. Photographic texture, physically plausible geometry.
```

2026-10-17 用户批准前台方案后，首页图复用为 `public/images/writing-hero.webp`；文章插图仍仅用于独立预览，不写入真实文章。
