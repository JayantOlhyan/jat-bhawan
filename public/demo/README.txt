Images for the page photo slots. Name a file after its slot, any of .jpg .jpeg .png .webp .avif:

  story          Home "idea" section (shown 4:3) + About page (shown 3:4)
  hall           Hall page main photo + the thumbnail in the home "hall" card
  hall-stage     Hall page gallery ("A look inside")
  hall-dining    Hall page gallery
  hall-entrance  Hall page gallery

Real photos vs samples
- <slot>.jpg (etc.) is the client's real photo.
- <slot>.sample.webp is a generated stand-in. The page labels it "नमूना चित्र / Sample image"
  and adds "(sample image)" to its alt text. Samples must be replaced before launch.
- A real <slot>.<ext> always wins over <slot>.sample.<ext>; delete the sample when the real one arrives.
- With neither, the main slots show a "photo here" placeholder and the gallery hides that tile
  (and its heading, if all three are missing).

No hand-resizing needed: next/image serves sized WebP. Rebuild after adding or removing files.
