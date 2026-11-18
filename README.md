<a href="https://mirrorandmountain.com" target="_blank"><img src="https://github.com/mirror-and-mountain/assets/raw/main/logos/png/mm-logo-slate-transparent-512.png" width="100" alt="MIRROR AND MOUNTAIN Logo"></a>

## MEROS Blocks

### Dynamic mega menu

Insert **Mega Menu** to start with one **Mega Menu Group** containing one
**Mega Menu Column**. Each additional group starts with one column too.
Use **Edit Column Links** in the inspector to select posts and reorder links.
Leave **Link label** blank to use the linked post's title. If the link doesn't
resolve to a publicly viewable post with a title, the URL is shown instead.
You can also insert **Paragraph** and **Image** blocks inside a column; they
appear below its links, or on their own if the column has no links.
Columns with only a title still render. Completely empty columns are omitted,
but their group's label remains visible without an empty submenu.
Existing custom links columns
keep their settings under the new name. The separate **Mega Menu Link Column**
that accepted native Navigation Link blocks is no longer registered.

An optional **Group link** makes the top-level label a link. If the group has
submenu content, hover mode opens the panel on hover and follows the link on click;
click mode opens the panel on the first pointer click and follows the link on
the next. Keyboard users can focus the label to follow the link directly or
focus the separate chevron to toggle the panel. In the mobile drawer, the label opens
the group screen, where a **Visit …** link leads to the destination. Groups
without submenu content link directly in either layout if a URL is set, or
show a plain label otherwise. Group links and individual
links in **Edit Column Links** can each be set to open in a new tab.
On any group with a submenu, turn on **Settings → Hide group chevron (desktop only)**.
The label opens the submenu whether or not a group link is set. The mobile
drawer always shows a forward-pointing chevron. On desktop, visible chevrons
point down when closed and rotate up when opened, respecting reduced motion.

On the **Mega Menu** block, use **Settings → Group layout** to choose
**Horizontal (header)** or **Vertical (sidebar)**. Horizontal menus are the
default and stack on small screens. Vertical menus always stack their groups
and expand panels inline so they stay inside the sidebar.

Use **Settings → Open groups on** to choose **Click** (the default) or
**Hover or click**. Hover is available with a mouse; touch and keyboard
activation use the same disclosure controls in both modes. Desktop headers
slide open a full-width panel with side-by-side columns. In a header block,
the panel opens below the whole header, not just below the navigation row.
The contents fade in near the end of the opening slide. In Click mode,
moving across the header keeps the current panel open. In Hover or click
mode, pause briefly over another group to swap its content without closing
and reopening the panel.
On small screens and in sidebars, panels expand in place and columns stack.
The desktop panel closes shortly after the pointer leaves both the header
and panel (or leaves the group in a sidebar), unless focus is inside the
panel. Reduced-motion preferences disable the slide and fade.

On the **Mega Menu** block, **Collapse on mobile** is enabled by default.
At **Collapse at or below (px)** (640px by default), the front-end menu
switches to a hamburger. The drawer can open from the left, right, or top
(right by default). Side drawers are two-thirds of the viewport wide
unless **Side drawer minimum width (px)** is larger, and never exceed the
viewport. Top drawers are always full width. Groups with columns open a
separate screen inside the drawer, with a Back button and stacked columns.
The group content fades in. **Settings → Animation speed** controls the
desktop panel slide and chevron rotation, mobile drawer slide, and group fade: Fast (150ms),
Normal (240ms, the default), Slow (400ms), or Off. Reduced-motion
preferences take precedence.
The page behind the drawer cannot scroll while it is open. Turn off
**Collapse on mobile** to keep the menu inline at all widths.

The editor mirrors the navigation row or sidebar; select a group or one of its
children to show that group's panel. Use **Styles → Mega menu colours** for
menu-wide colours, optionally overridden on groups and columns. Clear an
override to inherit the parent or default styling. The **Group label** colour
applies to the label and its chevron, whether or not the label is itself a
link. Panels default to white with black text. Unconfigured links use the
theme's link styles, with the panel text colour and dark grey underlined
hover/focus as fallbacks.

Use **Styles → Mega menu typography** on the menu to set column heading and
link sizes from the theme's font size presets. A column can override either
size independently. Choose **Default** to clear an override. With no
overrides, text uses the theme's typography, with column headings slightly
larger than body text unless the theme styles them directly.
The same panel offers **Text decoration** for non-linked group labels and
column headings, and **Link decoration** for menu links. Choose **Default**,
**None**, **Underline**, or **Strikethrough**. Groups and columns can override
the menu setting; **Default** leaves parent or theme styles in place. These
controls do not change the styles of blocks inserted inside a column.

The dynamic blocks render [Blade views](src/resources/views/mega-menu) through
Acorn. Their [styles and scripts](src/resources/assets/wordpress/src/mega-menu)
are enqueued independently of the legacy Navigation assets. To customize spacing and
typography in theme CSS, set `--meros-mega-menu-panel-border-width`,
`--meros-mega-menu-panel-border-color`, `--meros-mega-menu-column-gap`,
`--meros-mega-menu-column-title-size`, or `--meros-mega-menu-link-padding-block`.
Existing legacy menus are not migrated automatically.

Sticky header offsets are measured by the FX assets on the site and in the
block editor. They do not require the legacy Navigation assets or an active
FX preview.

For a header template part, set the **Template Part** block's HTML element to
**Header** and enable **Sticky Element → Enable Sticky Header** on that block.
**Header Animation** is also available on the template part itself. Use a
`div` for the Group inside it to avoid nested `<header>` elements. If the Group
previously held the sticky or animation settings, configure them on the
Template Part block before changing the Group's tag.

### License 
The Meros Framework and this extension are open-sourced software licensed under the MIT license.
