<a href="https://mirrorandmountain.com" target="_blank"><img src="https://github.com/mirror-and-mountain/assets/raw/main/logos/png/mm-logo-slate-transparent-512.png" width="100" alt="MIRROR AND MOUNTAIN Logo"></a>

## MEROS Blocks

### Masonry Query

Insert **Masonry Query** for a masonry-style post grid built around WordPress's
native **Query Loop**. Select the outer block's **Masonry layout** panel to set
desktop, tablet and mobile columns (1–6) and the card gap in pixels. Defaults
are 3/2/1 columns and a 24px gap. Frontend breakpoints use the viewport width:
desktop from 1024px, tablet from 640px, and mobile below 640px.
In the editor, columns follow WordPress's selected Desktop/Tablet/Mobile preview,
not the canvas width remaining after opening sidebars.

Enable **Vary card sizes** to mix single- and double-column cards with different
featured-image proportions. Sizes are derived from post IDs, so each post keeps
its variation between visits and in the editor. Images are cropped, never the
post's text. Wide cards reduce to one column on single-column layouts; disabling
the option restores native image proportions.

**Vary column count (experimental)** mixes column densities between groups of
posts. When enabled, the device controls become **Desktop/Tablet/Mobile max
columns**, reusing the existing values. **Subtle** (the default) alternates the
maximum and one fewer column, with a minimum of one; **Broader** varies from one
to the maximum. The choice is stable for the same posts, not shuffled on reload.
Masonry packing continues within each group, while density changes start below
the preceding group. This can leave uneven gaps or odd layouts, hence the
experimental label. It works alongside varied card sizes and full-width sticky
rows, and is off by default.

Enable **Prioritise sticky posts** to put matching WordPress sticky posts first,
each occupying a full-width row by default. Enable **Allow sticky posts to share
rows** beneath it to lay them out like other cards, including any card-size and
column-count variation. Their priority ordering is unchanged.
Sticky posts still count towards posts per page,
respect all query filters/exclusions, and are not repeated on subsequent pages.
The query's chosen ordering applies within the sticky and non-sticky groups.
This ordering is available for custom post queries; inherited template queries
keep their native ordering. The two options are independent and off by default.

Select the inner **Query Loop** to choose post types, filters, ordering and
posts per page. Edit its **Post Template** to design every card with native
blocks; the starter includes a linked featured image, linked title and excerpt.
The wrapper controls columns and gaps instead of the Post Template's layout
settings. Pagination and the editable **No Results** message remain native.
Each Query Loop receives its own WordPress query ID.

The same JS-assisted layout runs in the editor and on the front end, repacking
when cards, images, fonts or the available width change. Cards fill the next
available column without rearranging their DOM, reading or keyboard order.
Without JavaScript, the native Query Loop layout remains usable.

### Dynamic mega menu

Links to the current page are marked with `aria-current="page"` on the front
end, in both desktop and mobile menus. Set **Group link current** and **Panel
link current** under **Styles → Mega menu colours**, and their corresponding
**current decoration** controls under **Link decorations**. With no override,
theme and existing menu styles apply, with underline as a fallback. Matches
ignore fragments and trailing slashes but respect the domain, path, and query
parameters. Only the matching destination is highlighted, not its ancestor
group. A linked group's submenu label is highlighted too, including when its
desktop chevron is hidden. The editor's previews do not represent a visitor's
current page.

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
mode, hover for 200ms to open a panel or swap to another group's content without
closing and reopening the panel. Moving away before the delay ends cancels the
pending opening; clicks remain immediate.
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
children to show that group's panel. All menu styling controls are available on
**Mega Menu** as defaults and on **Mega Menu Group** as overrides. Clear a group
override (or choose **Default**) to inherit the menu setting. Columns have
native typography controls for their own content, but inherit colours from the group
or menu and do not apply old column-level colour overrides.

Under **Styles → Mega menu colours**, configure:

- **Panel background**
- **Group label** (unlinked labels only)
- **Group link**, **Group link hover**, **Group link current**
- **Column heading**
- **Panel link**, **Panel link hover**, **Panel link current**

Group colours also apply to their chevrons. **Current** means a link to the
current page, not keyboard focus. Hover colours also apply on keyboard focus;
an explicitly configured current-page colour takes precedence over hover/focus.
Panels default to white with black text. Unconfigured links use the
theme's link styles, with the panel text colour and dark grey underlined
hover/focus as fallbacks.

Under **Styles → Typography**, WordPress's native controls set the menu's base
font family, size, appearance (weight/style), line height, letter spacing, and
letter case. Their availability follows the theme's typography settings; some
are available through the Typography panel's options menu. Groups can set their
own base typography or inherit the menu's. Columns have the same native
Typography controls, so panel content can use a different font family or
appearance from the group labels/links. No baseline is set by default.

Font configuration uses only those native controls at each layer: menu, group,
and column. Reset a native typography setting to inherit from the parent or
theme. Old custom group/heading/link size attributes and heading-decoration
overrides no longer apply, so they cannot mask native font settings. Headings
retain their slightly larger theme-overridable fallback size.

Under **Styles → Link decorations**, choose **Default**, **None**, **Underline**,
or **Strikethrough**. Menu and Group blocks offer **Group decoration** (linked
and unlinked labels), **Panel link decoration**, and separate current-page
decorations for both kinds of link. Columns offer only panel-link and
panel-link current-page decorations. Clear a decoration override to inherit the
parent setting. These link controls do not style core blocks inserted inside a
column; those blocks can inherit native typography unless they have their own
styling.

Compatible saved menu/group styles are retained: old shared group colours and
current-page styles populate the corresponding separate controls. Editing a
style replaces these legacy values so each new control can be cleared or
changed independently. Legacy panel text colour remains readable but is no
longer offered as a control.

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
Select the header **Template Part** block in the template and enable
**Header Animation**. Use **Site Logo Shrink On Scroll** in that same panel
to set the logo's final scale. Use a `div` for the Group inside the template
part to avoid nested `<header>` elements. If the Group previously held the
sticky or animation settings, configure them on the Template Part block
before changing the Group's tag.

### License 
The Meros Framework and this extension are open-sourced software licensed under the MIT license.
