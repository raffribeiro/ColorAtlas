"""Generate the Color Atlas in-app guide (v2, task-first with interactive examples).

Output: work/atlas-documentation.html. Interactive behavior lives in
work/atlas-documentation-examples.js; styles in work/atlas-documentation.css.
Each example is a <figure class="doc-example" data-doc-example="NAME"> whose
controls are static HTML (so full-text search finds them); the examples module
binds behavior when the topic is first shown.
"""
from pathlib import Path
from html import escape
import json

OUT = Path(__file__).parent
catalog = json.loads((OUT / 'documentation-sources.json').read_text())
sources = [s for s in catalog['sources'] if s.get('guide')]
chapters = []


def link(key, label):
    return f'<a href="#doc-{key}" data-doc-link="{key}">{label}</a>'


def ref(url, label):
    return f'<a href="{url}" target="_blank" rel="noopener noreferrer">{label}</a>'


def table(headers, rows):
    head = ''.join(f'<th scope="col">{h}</th>' for h in headers)
    body = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>' for row in rows)
    return f'<div class="atlas-docs-table"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def kbd(*keys):
    return ' + '.join(f'<kbd>{k}</kbd>' for k in keys)


# Action-first prompts are intentionally separate from the explanatory captions.
# Keep one goal for every example so a reader knows what to change and observe.
EXAMPLE_GOALS = {
    'lookup': 'Drag Signal t to see which color a gray value picks.',
    'slice': 'Lower Lightness and watch the available yellow and blue change.',
    'munsell': 'Move Hue, then Value and Chroma, to locate one color in the diagram.',
    'interp': 'Enable the middle key and move it to compare smooth blends with hard steps.',
    'normalize': 'Enable Normalize values and watch the image use more of the ramp.',
    'blend': 'Switch between Normal and Add, then lower Opacity to compare the result.',
    'harmony': 'Choose a harmony and move Base hue to see the colors stay related.',
    'bloom': 'Move Bloom from 0% upward and watch the bright core spread light.',
    'vision': 'Switch Ramp and Vision to see which color differences remain visible.',
    'uv': 'Move t toward either end and compare the two sampling markers.',
    'srgb': 'Choose Once to make the engine ramp match the exported colors.'
}


def example(name, title, stage, controls, hint):
    """Interactive figure: goal, canvas/readout, controls and a local reset."""
    return (f'<figure class="doc-example" data-doc-example="{name}">'
            f'<div class="doc-ex-head"><span class="doc-ex-tag">Try it</span><span class="doc-ex-title">{title}</span></div>'
            f'<p class="doc-ex-goal">{EXAMPLE_GOALS[name]}</p>'
            f'<div class="doc-ex-stage">{stage}</div><div class="doc-ex-controls">{controls}'
            f'<button type="button" class="doc-ex-reset" data-doc-reset aria-label="Reset example: {title}">Reset example</button></div>'
            f'<figcaption>{hint}</figcaption></figure>')


def rng(key, label, lo, hi, val, step=1, unit=''):
    return (f'<label class="doc-ex-field"><span>{label}</span><input type="range" data-k="{key}" min="{lo}" max="{hi}" step="{step}" value="{val}">'
            f'<output data-o="{key}" data-u="{unit}">{val}{unit}</output></label>')


def sel(key, label, options, val):
    opts = ''.join(f'<option value="{v}"{" selected" if v == val else ""}>{t}</option>' for v, t in options)
    return f'<label class="doc-ex-field"><span>{label}</span><select data-k="{key}">{opts}</select></label>'


def chk(key, label, on=False):
    return f'<label class="doc-ex-check"><input type="checkbox" data-k="{key}"{" checked" if on else ""}><span>{label}</span></label>'


def color(key, label, val):
    return f'<label class="doc-ex-color"><input type="color" data-k="{key}" value="{val}"><span>{label}</span></label>'


def canvas(key, w, h, label):
    return f'<canvas data-c="{key}" width="{w}" height="{h}" role="img" aria-label="{escape(label, quote=True)}"></canvas>'


def readout(key):
    return f'<div class="doc-ex-readout" data-r="{key}" aria-live="polite"></div>'


def tip(text):
    return f'<p class="doc-note">{text}</p>'


def topic(key, title, group, lead, body):
    chapters.append((key, title, group,
                     f'<article id="doc-{key}" class="atlas-docs-article" data-doc-topic="{key}" hidden>'
                     f'<div class="atlas-docs-eyebrow">Color Atlas / {escape(group)}</div>'
                     f'<h1 tabindex="-1">{escape(title)}</h1><p class="doc-lead">{lead}</p>{body}</article>'))


# ---------------------------------------------------------------- Start here
topic('quick-start', 'Quick start', 'Start here',
      'Color Atlas builds gradient maps for VFX: color ramps that recolor a grayscale signal such as smoke density, particle age or a mask. '
      'You author the ramp, judge it on real images in the Preview, then export it as a texture or as engine data.',
      '<h2>The one idea</h2><p>A gradient map is a lookup. A value <code>t</code> between 0 and 1 picks a position on the ramp, and the ramp returns the color at that position. '
      'Black pixels of the source read the left end, white pixels read the right end. In an engine, <code>t</code> can be anything normalized: a texture channel, particle age, distance or a dynamic parameter.</p>'
      + example('lookup', 'Signal → color',
                canvas('ramp', 560, 96, 'Grayscale signal above the fire ramp it selects from') + readout('out'),
                rng('t', 'Signal t', 0, 1, .62, .01),
                'Drag the signal value. The marker reads the ramp at the same position: that is exactly what the Preview and your shader do per pixel.')
      + '<p>Pause over a control, or focus it with the keyboard, for a short explanation of what it does.</p>'
      + '<h2>From preset to texture</h2><ol>'
      '<li><strong>Start from a preset.</strong> Search the library on the left and click a preset. It replaces the ramp of the selected image layer.</li>'
      '<li><strong>Select a key.</strong> Click a row in the key list, or a marker under the Gradient Map.</li>'
      '<li><strong>Change its color.</strong> Click or drag in the color wheel, use the lightness and color sliders, or type a HEX and press Apply.</li>'
      '<li><strong>Shape the ramp.</strong> Drag markers along the Gradient Map or set Position. <kbd>+</kbd> adds a key, <kbd>−</kbd> removes the selected one.</li>'
      '<li><strong>Judge it in context.</strong> The Preview updates live. Switch Smooth/Bands, toggle layers, try Random.</li>'
      '<li><strong>Export.</strong> Press Export PNG, choose PNG, Unity C# or Unreal JSON, then download or copy.</li></ol>'
      + '<p>In the examples, the highlighted controls are yours to try. Follow the goal above each illustration, then drag sliders, choose a mode, or pick a color. <strong>Reset example</strong> restores that example without changing your work in the Editor.</p>'
      + tip('Prefer a guided tour? Press <strong>Tutorial</strong> at the top right for a short hands-on tour in three steps. Lightweight highlights and brief effects keep the tour responsive while you try the controls. The final card points you back to Documentation for interactive examples and engine setup. New here? Read ' + link('editing-color', 'Editing color') + ' and ' + link('gradients', 'Gradients') + ' next, then ' + link('export', 'Export and engine setup') + ' before you bring a texture into Unreal or Unity.'))

topic('interface', 'Interface and shortcuts', 'Start here',
      'The workspace has four zones: the library on the left, color authoring in the middle, the Gradient Map along the bottom and the Preview with its layers on the right. The top bar switches between Editor and Documentation and replays the Tutorial.',
      '<h2>Where things are</h2>'
      + table(['Zone', 'What you do there'], [
          ['Top bar', 'Use Editor, Documentation and Tutorial to switch tasks. The language menu translates the editor, Documentation, interactive examples, contextual help and Tutorial. English is the initial language and your choice is remembered. Palette names, layer names and your work are kept as entered.'],
          ['Library (left)', 'Search presets by name or mood. If nothing matches, try fire, ice or smoke. Open folders, star favorites and load My palettes.'],
          ['Authoring Colors', '3D color volume plus Lightness, Green–Red, Blue–Yellow and Saturation sliders, HEX input and <em>Lock base to sRGB</em>.'],
          ['Keys and color wheel', 'Key list with Copy HEX, <kbd>+</kbd>/<kbd>−</kbd>, and the color wheel for the selected key.'],
          ['Gradient Map (bottom)', 'The ramp, its markers, Smooth/Bands, Save palette, Position and Export PNG.'],
          ['Preview (right)', 'Recolored images, Random and its mode, color-vision menu, attention eye, bloom, Undo/Redo and Preview presets.'],
          ['Layers', 'Image stack: visibility, order, blend, opacity, Normalize values and Random ON/OFF per image.'],
          ['Tutorial (top bar)', 'Learn the editor by trying the highlighted controls. Choose Next to continue, Back to revisit, or Skip tutorial to leave. Finishing or leaving restores your previous scene, ramps and settings. Replay the tour from Tutorial in the top bar.']])
      + '<h2>Shortcuts and gestures</h2>'
      + table(['Action', 'Input'], [
          ['Undo / Redo', kbd('Ctrl/⌘', 'Z') + ' · ' + kbd('Ctrl/⌘', 'Shift', 'Z') + ' or ' + kbd('Ctrl', 'Y')],
          ['Remove selected key', kbd('Delete') + ' or <kbd>−</kbd> (asks for confirmation; at least two keys remain)'],
          ['Add a key', 'Click empty space on the ramp, or <kbd>+</kbd>'],
          ['Edit color in 3D', 'Drag the selection circle'],
          ['Rotate 3D view', 'Drag anywhere else for a responsive view · ' + kbd('Shift') + '-drag always rotates'],
          ['Pan / zoom (3D, wheel, Preview)', 'Middle-drag / mouse wheel · Reset view restores'],
          ['Resize panels', 'Drag a divider · arrow keys on a focused divider · double-click or ' + kbd('Home') + ' resets'],
          ['Skip splash, close dialogs, leave the tutorial', kbd('Esc')],
          ['Tutorial: next / back', kbd('→') + ' / ' + kbd('←')]])
      + '<p>Undo keeps the last 10 edits; a whole drag counts as one. Camera moves, panel sizes and library management are not undoable, and reloading clears the history.</p>'
      '<h2>Saving your work</h2>'
      + table(['What', 'How', 'Contains'], [
          ['My palettes', 'Save palette (name + optional description)', 'The active ramp or both ramps of the layer: keys, positions, alpha, Smooth/Bands.'],
          ['Favorites', 'Star a preset or palette', 'A reference to it.'],
          ['Preview presets', 'New preset / Save in the Preview header', 'Images, order, names, visibility, blend, opacity, maps and Random ON/OFF. Not view, bloom or vision.'],
          ['Library file', '<strong>Export</strong> / <strong>Import</strong> next to PALETTES', 'My palettes, favorites and your Preview presets in one JSON file. Import adds to the current library; nothing is deleted.']])
      + tip('<strong>Your library lives in this browser.</strong> It is tied to the browser profile and the exact file path of the app. Opening the HTML from another folder, in another browser or after clearing site data shows an empty library. '
            'Use <strong>Export</strong> to keep a backup file, and <strong>Import</strong> to restore it or move it to another computer.')
      + '<p>Uploaded images and the current layer stack are saved in this browser and restored when you reopen the app. On first launch, Default is shown. You can select Default again from Preview presets without deleting your saved presets. Export a library backup before clearing browser data or moving to another browser.</p>'
      + '<p>Limits: My palettes has an 8 KiB budget (capacity depends on key counts); a save that does not fit is refused. Preview scenes hold up to eight PNG/JPEG/WebP images of up to 20 MB each, 8192 px per side and 32 megapixels. Library imports accept JSON up to 64 MB, with up to 256 palettes, 2048 favorites, 256 folders and 256 Preview presets.</p>')

# ------------------------------------------------------------------- Color
topic('editing-color', 'Editing color', 'Color',
      'Colors are edited in OKLab: one lightness axis and two color axes. You can change hue and strength while lightness stays put, which keeps the value structure of a ramp under control.',
      '<h2>The controls</h2>'
      + table(['Control', 'Meaning'], [
          ['L (Black–White)', 'Perceived lightness, 0–100.'],
          ['Green–Red, Blue–Yellow', 'The two OKLab color axes (shown ×250). Together they set hue and chroma.'],
          ['Saturation', 'Chroma relative to the strongest sRGB color at the same lightness and hue (with Lock base to sRGB on; off, relative to a fixed chroma of 100). Not HSV saturation.'],
          ['Color wheel', 'A continuous color surface through OKLab at the selected key’s lightness: yellow up, blue down, green-cyan left, red-magenta right. Distance from the center is chroma. Picks are always fitted into sRGB.'],
          ['3D volume', 'A faint sRGB cloud with a continuous color surface at the selected key’s lightness, arranged like a Munsell color tree (below). Drag the selection circle to edit live. Rotation is off by default.'],
          ['Lock base to sRGB', 'On: sliders stop at the sRGB boundary. Off: sliders may request colors outside it, and the stored HEX is clipped.']])
      + example('slice', 'One lightness slice of OKLab',
                canvas('plane', 280, 280, 'OKLab a/b plane at the chosen lightness; dimmed areas are outside sRGB') + readout('out'),
                rng('L', 'Lightness', 1, 99, 70, 1) + chk('fit', 'Fit into sRGB (like the wheel)', True),
                'Click or drag in the slice. Lower the lightness and watch yellow disappear while blue keeps its strength: sRGB cannot show a dark yellow or a light saturated blue. Turn fitting off to see how a request outside sRGB gets clipped.')
      + '<h2>Munsell Color Method: Hue, Value and Chroma</h2><p>Munsell inspired the spatial organization of our 3D color graph: lightness rises vertically, hue moves around the neutral axis, and chroma grows outward. Munsell writes these as H V/C, such as 5R 5/6. Color Atlas measures its main graph in OKLab.</p>'
      + example('munsell', 'Explore Hue, Value and Chroma',
                canvas('tree', 640, 430, 'Munsell diagram: neutral Value column from 0 to 10, Hue ring and numbered radial Chroma chips; white outline identifies the selected chip') + readout('out'),
                rng('H', 'Hue', 0, 9, 0).replace('>0</output>', '>5R · Red</output>').replace('value="0"', 'value="0" aria-valuetext="5R · Red"')
                + rng('V', 'Value', 1, 9, 5) + rng('C', 'Chroma', 0, 26, 6, 2),
                'Hue moves the white outline between color families, Value moves the ring up the gray column and Chroma moves outward along the numbered chips. Chroma 0 is neutral gray; the available Chroma depends on Hue and Value. Ring radius is schematic. Chips are 1943 renotation samples in sRGB; those outside sRGB are left out.')
      + '<h3>From Munsell to our OKLab graph</h3>'
      + table(['Munsell idea', 'In Color Atlas'], [['Value: dark to light', 'Height is OKLab L, on our Black–White slider.'], ['Hue: color family around the axis', 'The angle in the a/b plane identifies hue; the wheel shows a slice at one L.'], ['Chroma: distance from gray', 'Distance from the central neutral axis is OKLab chroma.']])
      + '<p>This is a shared organizing idea, not a numeric conversion. On the bundled samples:</p>'
      + table(['Munsell', 'OKLab (UI units)'], [['Value 1 · 3 · 5 · 7 · 9', 'L 23 · 40 · 58 · 75 · 92'], ['10 principal hues, 36° apart', 'Neighbors 25°–54° apart (6/6)'], ['Chroma 6 at Value 6', 'Chroma 16–26, by hue']])
      + '<p>In our graph, hue and chroma are the polar reading of OKLab, called OKLCh. The changing outer shape follows the sRGB gamut.</p>'
      + '<h2>Reading the 3D view</h2>'
      + '<figure class="doc-volume-figure"><div data-doc-volume></div><figcaption>The subtle, translucent central cylinder runs from Black to White; its small ring follows the selected lightness. Looking down onto the slice, the White side of the column is in front and the Black side is behind it; looking from below reverses this overlap. While you drag the color selector, the axes and neutral column fade so you can focus on the color; release to restore them. The graph from the editor: the bright plane marks the selected lightness, crossed by subtle Red–Green and Yellow–Blue axes in their true colors; the numbered dashed path connects your gradient keys. The continuous color surface shows available sRGB colors at the selected lightness, including the gamut edge; the faint cloud gives the surrounding sRGB volume in OKLab. Use the Editor to rotate and edit it.</figcaption></figure>'
      +
      '<p>The 3D view is a <strong>color solid</strong>: every color your screen can show, placed the way Albert Munsell organized color in his color tree, but measured with OKLab.</p><ul>'
      '<li><strong>Up and down is lightness.</strong> Black at the bottom, white at the top, grays on the vertical axis.</li>'
      '<li><strong>Around the axis is hue.</strong> Red, yellow, green and blue sit at different angles; a turn around the axis walks the color wheel.</li>'
      '<li><strong>Outward is chroma.</strong> Colors grow stronger the farther they are from the gray axis.</li>'
      '<li><strong>The shape is the limit of sRGB.</strong> It bulges where a screen can show strong colors (bright yellows, dark blues) and narrows near black and white.</li>'
      '<li><strong>Your ramp is the dashed path.</strong> Numbered circles are your keys (1 is the rightmost key). A path that climbs steadily reads clearly in an effect; a path that zigzags in height makes bands of light and dark.</li></ul>'
      '<p>Drag the selected circle to recolor that key. Drag elsewhere to rotate, Shift-drag always rotates, middle-drag pans and the mouse wheel zooms; Reset view returns to the default angle.</p>'
      + '<h2>What this means for ramps</h2><ul>'
      '<li><strong>Let lightness carry the structure.</strong> Fire, plasma and most emissive ramps read best when L rises steadily from left to right.</li>'
      '<li><strong>Hue and lightness are linked by the display.</strong> Vivid yellows exist only near the top of L, vivid blues and purples only lower down. Plan hue shifts with that in mind.</li>'
      '<li><strong>Near black and white, color collapses.</strong> Saturation can become unavailable there; that is the sRGB gamut, not a bug.</li></ul>'
      + tip('Numbers in the UI are OKLab scaled for readability (L ×100, a and b ×250). They are not CIE L*a*b* values, and distances are not ΔE.'))

topic('gradients', 'Gradients: keys, Smooth and Bands', 'Color',
      'A ramp is a list of color keys at positions from 0 to 100%. Smooth blends between neighboring keys; Bands holds each key’s color until the next one.',
      '<h2>Keys</h2><ul>'
      '<li>Each ramp has 2–16 color keys. Key numbers count from the bright, right end: <strong>1</strong> is the rightmost key.</li>'
      '<li>Click empty ramp space to add a key, drag a marker to move it, or set Position for exact placement.</li>'
      '<li>Ramps also carry alpha keys. They are kept when you save and export, but are not edited in this workspace; new ramps are fully opaque.</li>'
      '<li>Two keys at the same position make a hard edge, even in Smooth.</li></ul>'
      '<h2>Smooth vs Bands</h2>'
      + example('interp', 'Same keys, three blends',
                canvas('ramps', 560, 168, 'The same keys rendered with OKLab Smooth, linear RGB and Bands'),
                color('c0', 'Left', '#1464e8') + color('c1', 'Middle', '#f4f1ea') + color('c2', 'Right', '#ffbd32')
                + chk('mid', 'Use middle key', False) + rng('p', 'Middle position', 5, 95, 50, 1, '%'),
                'Smooth follows the editor (OKLab). Linear RGB is the export compatibility option: same keys, different in-between colors. The example starts with two keys: blue and yellow are opposites, so OKLab passes close to neutral gray while linear RGB detours through lilac and pink. Enable Use middle key to steer the path.')
      + table(['Mode', 'Use it for'], [
          ['Smooth', 'Continuous gradients: fire, smoke, energy, falloff. Interpolated in OKLab, so lightness and hue change evenly.'],
          ['Bands', 'Toon and cel looks, stepped UI states, posterized effects. Export with point (nearest) filtering to keep hard steps.']])
      + tip('Export can blend Smooth in OKLab (matches the editor) or in linear RGB (matches engines that cannot do OKLab). See ' + link('export', 'Export and engine setup') + '.'))

# ----------------------------------------------------------------- Preview
topic('layers', 'Preview layers', 'Preview',
      'The Preview converts each image to grayscale, recolors it with that image’s own Gradient Map and stacks the results like layers in a compositor. Select a layer row to edit its ramp.',
      '<h2>How an image becomes a signal</h2>'
      '<p>Imported images are fitted into 512 × 512 and converted to grayscale (Rec. 709 weights on the encoded values). Brightness 0 reads the left end of the ramp, 255 the right end. Image alpha is kept and multiplies the ramp’s alpha.</p>'
      '<h2>Normalize values</h2><p>Many renders never reach pure black or white, so they only use part of the ramp. <strong>Normalize values</strong> (per layer, off by default) stretches the darkest visible pixel to 0 and the brightest to 255. Turning it off restores the original values.</p>'
      + example('normalize', 'A low-contrast render',
                canvas('img', 240, 240, 'Smoke-like grayscale image mapped through a fire ramp') + canvas('hist', 300, 240, 'Histogram of the grayscale values over the ramp'),
                chk('on', 'Normalize values', False),
                'This source only covers the middle of the brightness range, so the dark and hot ends of the ramp never appear. Normalize spreads it over the whole ramp.')
      + '<h2>The layer stack</h2>'
      + table(['Control', 'Effect'], [
          ['Row order', 'Top row is in front. Arrows reorder.'],
          ['Checkbox', 'Shows or hides the image.'],
          ['Click / Shift-click', 'Selects the layer whose ramp you edit / selects several.'],
          ['ON / OFF chip', 'Whether Random recolors this layer.'],
          ['+ / Replace image / Rename / −', 'Import, swap the image keeping its ramps, rename, remove.'],
          ['Blend, Opacity', 'How the selected layer combines with the layers behind it.'],
          ['Export Preview', 'Downloads the full 512 × 512 composite, with bloom and vision filter, without the attention overlay.']])
      + '<p>The Default scene uses the library Fire ramp for Explosion_Emissive in Add, including a black point at 0% and a dark ember at 7.2%.</p>'
      + '<h2>Blend modes</h2>'
      + example('blend', 'Fire over smoke',
                canvas('out', 300, 220, 'Fire layer composited over a smoke layer with the chosen blend mode'),
                sel('mode', 'Blend', [('normal', 'Normal'), ('multiply', 'Multiply'), ('screen', 'Screen'), ('overlay', 'Overlay'), ('add', 'Add')], 'add')
                + rng('op', 'Opacity', 0, 100, 100, 1, '%'),
                'Add is the usual choice for emissive layers: it can only brighten. Multiply darkens, Screen brightens softly, Overlay boosts contrast.')
      + '<p>Blending runs in linear light, so results can differ slightly from Photoshop, which blends encoded values. Add clamps at full white.</p>'
      '<h2>Importance 01 and 02</h2><p>Every image stores two ramps, Importance 01 and Importance 02. The editor always edits the active one, Random can recolor both, and export can write both as two rows of one texture.</p>'
      '<h2>Preview presets and navigation</h2><p>Preview presets save the whole scene (see ' + link('interface', 'Saving your work') + '). Loading one recenters the view. Zoom with the wheel (1–400%), pan with middle-drag, and press Reset view to fit the image again.</p>')

topic('random', 'Presets and Random', 'Preview',
      'Presets reproduce authored ramps; Random invents new ones for the layers you switched ON. Both are starting points: keep what works and refine it by hand.',
      '<h2>The library</h2><p>The bundled library has 1086 presets in seven groups (Effects, Nature & materials, Color studies, Data & diagnostics, Art studies, Design studies, Color & experiments). Search matches names, tags and folder names. A preset replaces the ramp of the selected layer; the star adds it to Favorites.</p>'
      '<h2>Random</h2><p>Press <strong>Random</strong> to recolor every layer whose chip is ON. Key count and alpha stay. Most modes keep key positions; Perceptual respaces keys along its path. Graphic Design - Smooth and Graphic Design - Bands apply their named interpolation when Random is pressed. Selecting a mode leaves ramps unchanged. Other modes apply Smooth. Undo restores the previous colors.</p>'
      + table(['Mode', 'What it does', 'Use it for'], [
          ['Perceptual', 'Colors at equal perceptual steps along a random OKLab path.', 'Clean, readable ramps.'],
          ['Harmonic', 'Picks a harmony (mono, analogous, complementary, split, triadic, tetradic) and keeps the best candidate.', 'Balanced palettes without choosing a rule.'],
          ['Monochromatic … Tetradic', 'Fixed hue relationships (see below).', 'When you know the relationship you want.'],
          ['Warm / Cool', 'Hues around orange-red / around cyan-blue.', 'Fire and heat / ice, magic, sci-fi.'],
          ['Free random', 'Independent random RGB. No rules.', 'Breaking out of habits.'],
          ['ColorPlay', 'Builds 16 candidate pairs and scores them on your actual image, on dark and light backgrounds. Compare shows the colors in context.', 'Palettes tuned to a specific effect.'],
          ['Graphic Design - Smooth / Graphic Design - Bands', '15 harmonic/design families with 60/30/10 hue roles; Add layers become the accent. Both keep key positions and ordered value.', 'Smooth transitions or stepped Bands, applied on Random.']])
      + '<p>Guided modes look at how much of the image each layer covers: the largest layer gets the dominant hue family, smaller ones the supporting and accent families, and — except in Free and Graphic Design — each key keeps its luminance so the value structure survives.</p>'
      + example('harmony', 'Hue relationships',
                canvas('wheel', 260, 260, 'OKLab hue ring with the hues of the chosen harmony') + canvas('ramp', 300, 260, 'Sample ramp built from the harmony hues'),
                rng('h', 'Base hue', 0, 359, 40, 1, '°')
                + sel('mode', 'Harmony', [('monochromatic', 'Monochromatic'), ('analogous', 'Analogous'), ('complementary', 'Complementary'), ('split', 'Split complementary'),
                                           ('triadic', 'Triadic'), ('tetradic', 'Tetradic'), ('warm', 'Warm'), ('cool', 'Cool')], 'split'),
                'Angles are measured on the OKLab hue circle, not a painter’s RYB wheel. Random also varies chroma and lightness and compares candidates; this shows only the hue skeleton.')
      + tip('ColorPlay is inspired by Josef Albers’ exercises on how surroundings change a color. Its scoring is a Color Atlas heuristic, not an Albers rule.'))

topic('analysis', 'Analysis tools', 'Preview',
      'Bloom, color-vision simulation and the attention overlay help you judge an effect. They change only the Preview — never the ramp or the export.',
      '<p>Processing order: <strong>gradient mapping → layer blending → bloom → color-vision filter → attention overlay</strong>.</p>'
      '<h2>Bloom</h2><p>The Post-process bloom slider (0–700%) adds glow to areas whose linear luminance passes about 0.45, with a soft knee so edges do not outline. Use it to check how a ramp will feel under an engine’s bloom; your engine’s bloom, exposure and tone mapping will still differ.</p>'
      + example('bloom', 'Highlight bloom',
                canvas('out', 300, 220, 'Fire blob with preview bloom'),
                rng('b', 'Bloom', 0, 700, 100, 1, '%'),
                'Only the hot core contributes. If a ramp never reaches high luminance, bloom has nothing to grab.')
      + '<h2>Color-vision simulation</h2><p>The vision menu simulates protan, deutan and tritan deficiencies (full and 50% severity) and a grayscale check. A split handle compares regular and simulated views. The goal: important structure should survive even when some hues merge.</p>'
      + example('vision', 'Does the ramp survive?',
                canvas('out', 560, 150, 'Regular and simulated version of the chosen ramp'),
                sel('pal', 'Ramp', [('fire', 'Fire'), ('alert', 'Red → green status'), ('toxic', 'Toxic'), ('rainbow', 'Rainbow')], 'alert')
                + sel('mode', 'Vision', [('protanopia', 'Protanopia'), ('deuteranopia', 'Deuteranopia'), ('tritanopia', 'Tritanopia'), ('protanomaly', 'Protanomaly 50%'),
                                         ('deuteranomaly', 'Deuteranomaly 50%'), ('tritanomaly', 'Tritanomaly 50%'), ('grayscale', 'Grayscale')], 'deuteranopia'),
                'A red-to-green status ramp collapses for deutan viewers; fire survives because its lightness rises. When meaning matters, encode it in lightness, not hue alone.')
      + '<h2>Attention overlay</h2><p>The eye toggle marks up to three regions that stand out, numbered 1–3, from a mix of brightness contrast, color contrast and edges. Use it to check that the eye lands on the core of the effect rather than a stray hot spot. '
      'It is a fast heuristic, not eye tracking: it ignores motion, faces, text and the game scene around the effect.</p>')

# ------------------------------------------------------------------ Export
topic('export', 'Export and engine setup', 'Export',
      'Export PNG writes the ramp as a lookup texture, or copies key data for Unity or Unreal. The texture holds only the ramp — not the image, bloom or other preview filters.',
      '<h2>The export dialog</h2>'
      + table(['Option', 'Choices'], [
          ['Format', 'PNG texture (downloaded) · Unity C# · Unreal JSON (copied after review).'],
          ['Layers', 'Active layer, or both. PNG stacks Importance 01 above Importance 02.'],
          ['Smooth interpolation', '<strong>Perceptual (OKLab)</strong>, the default, matches the editor. <strong>Linear RGB</strong> for engines that blend RGB. Bands is unaffected.'],
          ['Width / Height per layer', 'PNG only. Width 1–4096, height 1–1024 per layer. Default 256 × 16.'],
          ['Alpha', 'Ramp alpha is written as is (straight, not premultiplied).'],
          ['File name', 'PNG only; invalid characters are removed.']])
      + '<h2>Sampling the texture</h2><p>Sample at texel centers so 0 and 1 hit the end colors exactly:</p>'
      '<pre>u = (t · (W − 1) + 0.5) / W\nv = 0.5                 one layer\nv = 0.25 / 0.75         Importance 01 / 02 (top-left origin)</pre>'
      + example('uv', 'Where a value lands in the texture',
                canvas('tex', 560, 150, 'Exported texture rows with the sampled texel highlighted') + readout('out'),
                sel('w', 'Width', [('8', '8'), ('16', '16'), ('32', '32'), ('64', '64'), ('256', '256')], '16')
                + sel('layers', 'Layers', [('1', 'Active layer'), ('2', 'Both')], '2')
                + sel('row', 'Sample', [('0', 'Importance 01'), ('1', 'Importance 02')], '0')
                + rng('t', 't', 0, 1, .9, .01),
                'With a narrow texture, using u = t directly shifts the ramp by up to half a texel. The remap above removes that shift. Check v in your engine: some flip the vertical origin.')
      + '<h2>Unreal Engine 5</h2><ol>'
      '<li><strong>Texture asset:</strong> sRGB on · Compression Settings <em>UserInterface2D (RGBA)</em> to avoid block-compression banding · Mip Gen Settings <em>NoMipmaps</em> · X and Y tiling <em>Clamp</em> · Filter <em>Nearest</em> for Bands, default bilinear for Smooth.</li>'
      '<li><strong>Material:</strong> drive a TextureSample with UV = (u, v). Feed u from your scalar — a mask channel, <em>Particle Relative Time</em>, a Dynamic Parameter — remapped with the formula above.</li>'
      '<li><strong>Niagara:</strong> drive the scalar per particle (for example Normalized Age, which the material reads as Particle Relative Time), or rebuild a color curve from the JSON keys.</li>'
      '<li><strong>JSON:</strong> descriptive key data, not a .uasset. A CurveLinearColor blends in linear RGB, so it only matches a <em>Linear RGB</em> export; for the OKLab look, use the PNG.</li></ol>'
      '<h2>Unity</h2><p>Copy Unity C# builds <code>Gradient</code> objects. Perceptual uses <code>GradientMode.PerceptualBlend</code> with <code>ColorSpace.Linear</code> (Unity 6); Linear RGB uses <code>Blend</code>, Bands uses <code>Fixed</code>. Unity gradients hold at most 8 color and 8 alpha keys, so larger ramps fall back to JSON without dropping keys. '
      'For the PNG: sRGB on, Wrap Mode Clamp, mipmaps off, Point filter for Bands.</p>'
      '<h2>Decode sRGB exactly once</h2>'
      + example('srgb', 'Getting the colors you exported',
                canvas('out', 560, 120, 'Intended ramp and the ramp as the engine would show it'),
                sel('mode', 'Engine decodes sRGB', [('once', 'Once — correct'), ('never', 'Never (sRGB off)'), ('twice', 'Twice (also in shader)')], 'never'),
                'The PNG stores sRGB-encoded colors. With sRGB off they are read as linear and look washed out; decoding twice makes them dark and saturated.')
      + tip('Still different after that? Check compression, tone mapping, exposure, filtering and the blend mode of the material. Perceptual export matches the editor’s math, not every pixel of your final frame.'))

# --------------------------------------------------------------- Reference
topic('troubleshooting', 'Troubleshooting', 'Reference',
      'Most surprises come from the selected layer, the signal being mapped or the texture settings in the engine. Check those before changing colors.',
      table(['Symptom', 'Check'], [
          ['My palettes or presets are gone', 'Same browser, same profile, same file path? Clearing site data or moving the HTML starts a new library. Import your last library file to bring them back.'],
          ['My palettes is full', 'The 8 KiB budget is used. Export what you need, then delete unused entries.'],
          ['A preset changed only one layer', 'Presets apply to the selected layer. Select another row to edit it.'],
          ['Random changed nothing', 'Every layer is OFF. Switch the chip ON for the layers Random may recolor.'],
          ['Ramp uses only part of the colors', 'The source has low contrast. Turn on Normalize values for that layer.'],
          ['A saturated color shifted', 'It was outside sRGB and got fitted or clipped. See ' + link('editing-color', 'Editing color') + '.'],
          ['Smooth looks stepped', 'Bands is selected, or the texture is narrow, compressed or point-filtered.'],
          ['PNG looks different in the engine', 'sRGB decoded once? Compression off? Linear RGB export when the engine blends RGB? See ' + link('export', 'Export and engine setup') + '.'],
          ['Two layers appear swapped', 'The engine flips v. Sample v = 0.75 for Importance 01 or flip the coordinate.'],
          ['Download PNG does nothing', 'The browser blocked the download; check its download permissions and folder.'],
          ['Copy HEX does not paste', 'Look for the “Copied #HEX” message. If automatic copy fails, a Copy manually dialog opens with the text selected.'],
          ['3D picking fails at an angle', 'The slice is edge-on. Shift-drag to tilt it.']])
      + '<h2>Isolate the difference</h2><ol><li>Set Regular Vision, turn off the eye and set bloom to 0.</li><li>Export a Perceptual PNG and compare its colors with the editor.</li><li>Re-enable bloom, vision and layers one at a time to find which step changes the look.</li></ol>')

glossary = table(['Term', 'Meaning in Color Atlas'], [
    ['Signal / t', 'Normalized value 0–1 that picks a position on the ramp.'],
    ['Key', 'A color (or alpha) value at a position on the ramp.'],
    ['Smooth / Bands', 'Interpolate between keys / hold each key until the next.'],
    ['OKLab', 'Perceptual color space used for editing and Smooth blending.'],
    ['Chroma', 'Distance from neutral gray; color strength.'],
    ['Saturation (in the app)', 'Chroma relative to the strongest sRGB color at the same lightness and hue.'],
    ['Gamut', 'The colors a display space (here sRGB) can show.'],
    ['sRGB / linear', 'Encoded values stored in HEX and PNG / decoded values used for light math and blending.'],
    ['Importance 01 / 02', 'The two ramps every image layer carries.'],
    ['LUT', 'Lookup texture: the exported ramp.'],
    ['Straight alpha', 'Color and opacity stored separately (not premultiplied).']])

formulas = ('<details class="doc-details"><summary>Formulas used by the app</summary>'
            '<h3>sRGB transfer</h3><pre>linear(c) = c / 12.92                    c ≤ 0.04045\n          = ((c + 0.055) / 1.055)^2.4    otherwise\nsRGB(x)   = 12.92 x                      x ≤ 0.0031308\n          = 1.055 x^(1/2.4) − 0.055      otherwise</pre>'
            '<h3>OKLab scaling and Smooth interpolation</h3><pre>L_UI = 100 L,  a_UI = 250 a,  b_UI = 250 b\nw    = (t − t₀) / (t₁ − t₀)\nq(t) = (1 − w) OKLab(key₀) + w OKLab(key₁)\nRGB  = clamp(OKLab→linear sRGB(q(t)), 0, 1)        alpha interpolates separately</pre>'
            '<h3>Gamut fitting and Saturation</h3><pre>fit: largest k ∈ [0, 1] with linearRGB(L, k·a, k·b) in [0, 1]³   (32-step binary search)\nC = √(a_UI² + b_UI²)\nS = clamp(100 · C / C_ref, 0, 100)%     C_ref = fitted chroma of a radius-100 point at the same L and hue\nLock off:  C_ref = 100</pre>'
            '<h3>Grayscale signal and Normalize values</h3><pre>g = 0.2126 R + 0.7152 G + 0.0722 B        (encoded bytes)\nNormalize: v = round(255 (g − g_min) / (g_max − g_min))\nt = v / 255,   output alpha = ramp alpha × image alpha</pre>'
            '<h3>Layer blending (linear light, source-over)</h3><pre>Multiply  b·s          Screen  b + s − b·s          Add  min(1, b + s)\nOverlay   2 b s  if b ≤ 0.5,  else 1 − 2 (1 − b)(1 − s)\nα = αs + αb (1 − αs)\nC = [(1 − αs) αb Cb + αs ((1 − αb) Cs + αb Blend(Cb, Cs))] / α</pre>'
            '<h3>Bloom highlight</h3><pre>Y = 0.2126 R + 0.7152 G + 0.0722 B          (linear)\nz = clamp(Y − 0.45 + 0.15, 0, 0.30)\nh = min(1, max(Y − 0.45, z² / 0.60) / max(Y, 10⁻⁶))\nblur radii 10 px and 3 px at 512 px, screen-blended on the encoded sRGB image at B and 0.7 B</pre>'
            '<h3>Munsell samples</h3><pre>renotation xyY (Illuminant C, 2°) → Bradford C → D65 → linear sRGB, shown if in [0, 1]³\nneutrals: Y = 0.975 · Newhall (1943) Value polynomial</pre>'
            '<h3>Color vision</h3><pre>RGB_sim = clamp(M_mode · RGB_linear, 0, 1)        Machado, Oliveira and Fernandes (2009) matrices</pre>'
            '<h3>Attention</h3><pre>S = 0.35 intensity contrast + 0.35 color contrast + 0.15 edge contrast + 0.15 global color distance\nfoci: strongest peaks, suppressing 12% of the shorter side around each; stop at 3 or below 20% of the first</pre>'
            '<h3>PNG sampling</h3><pre>t = x / (W − 1);  RGB byte = round(255 · sRGB(ramp(t)));  alpha byte = round(255 · α(t));  row repeated H times per layer</pre></details>')


def source_list():
    items = []
    for s in sources:
        links = ' · '.join(ref(l['url'], escape(l['label'])) for l in s['links'])
        items.append(f'<li><strong>{escape(s["title"])}</strong> — {escape(s["author"])}, {escape(s["year"])}. {escape(s["guide"])} {links}</li>')
    return '<ul class="doc-sources">' + ''.join(items) + '</ul>'


topic('reference', 'Glossary and technical reference', 'Reference',
      'Short definitions of the terms used in the guide, the formulas behind each feature and the sources they come from.',
      '<h2>Glossary</h2>' + glossary + '<h2>Technical reference</h2>' + formulas
      + '<h2>Sources</h2>' + source_list()
      + '<p>Coordinate scaling, the Saturation control, Random recipes, ColorPlay scoring, bloom parameters and the attention weights are Color Atlas design choices, documented from the current source.</p>')

# ------------------------------------------------------------------ Assemble
groups = []
for key, title, group, _ in chapters:
    if group not in groups:
        groups.append(group)
nav = ''.join('<h2>' + escape(g) + '</h2>' + ''.join(link(k, escape(t)) for k, t, gg, _ in chapters if gg == g) for g in groups)
page = ('<section id="atlas-documentation" class="atlas-docs" aria-label="Color Atlas documentation" lang="en" hidden>'
        '<aside class="atlas-docs-sidebar"><p class="atlas-docs-eyebrow">Documentation</p>'
        '<label class="atlas-docs-search-label" for="atlas-doc-search">Search the guide</label>'
        '<input id="atlas-doc-search" type="search" placeholder="Search controls, terms, engines…" autocomplete="off">'
        '<p id="atlas-doc-results" role="status" aria-live="polite"></p>'
        f'<nav aria-label="Documentation chapters">{nav}</nav></aside>'
        '<div class="atlas-docs-reading"><p id="atlas-doc-empty" class="doc-note" hidden>No matching topics. Try a control name such as Normalize, a term such as OKLab, or an engine name.</p>'
        + ''.join(c[3] for c in chapters)
        + '<nav class="atlas-docs-pagination" aria-label="Adjacent documentation topics"><button type="button" data-doc-previous>← Previous topic</button><button type="button" data-doc-next>Next topic →</button></nav></div></section>')
(OUT / 'atlas-documentation.html').write_text(page)
md = ['# Color Atlas sources', '', 'Sources cited in the in-app guide.', '']
for s in sources:
    md.append(f'- **{s["title"]}** — {s["author"]}, {s["year"]}. {s["guide"]} ' + ' · '.join(f'[{l["label"]}]({l["url"]})' for l in s['links']))
(OUT.parent / 'outputs' / 'color-atlas-sources.md').write_text('\n'.join(md) + '\n')
print(f'Generated {len(chapters)} topics, {page.count("data-doc-example=")} interactive examples, {len(page.encode()):,} bytes')
