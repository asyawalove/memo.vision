import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { Gallery } from "./gallery-block";
import { Callout } from "./callout-block";
import { Columns } from "./columns-block";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    gallery: Gallery(),
    callout: Callout(),
    columns: Columns(),
  },
});

export type PortfolioBlock = typeof schema.Block;
export type PortfolioPartialBlock = typeof schema.PartialBlock;
export type PortfolioEditorInstance = BlockNoteEditor<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;
