import { BLOCKS, Document, Node } from '@contentful/rich-text-types';
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { Typography, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const ContentfulRenderer: React.FC<{ richTextDocument: Document }> = ({ richTextDocument }) => {
  const options: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: Node, children: React.ReactNode) => <Typography paragraph>{children}</Typography>,
      [BLOCKS.HEADING_1]: (node: Node, children: React.ReactNode) => (
        <Typography variant="h1" textAlign="center" my={3}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_2]: (node: Node, children: React.ReactNode) => (
        <Typography variant="h2" textAlign="center" my={3}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_3]: (node: Node, children: React.ReactNode) => (
        <Typography variant="h3" mt={8} mb={2}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_4]: (node: Node, children: React.ReactNode) => (
        <Typography variant="h4" textAlign="center" my={3}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_5]: (node: Node, children: React.ReactNode) => (
        <Typography variant="h5" textAlign="center" my={3}>
          {children}
        </Typography>
      ),
      [BLOCKS.HEADING_6]: (node: Node, children: React.ReactNode) => (
        <Typography variant="h6" textAlign="center" my={3}>
          {children}
        </Typography>
      ),
      [BLOCKS.UL_LIST]: (node: Node, children: React.ReactNode) => <List>{children}</List>,

      [BLOCKS.LIST_ITEM]: (node: Node, children: React.ReactNode) => (
        <ListItem alignItems="flex-start">
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <FiberManualRecordIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText primary={children} />
        </ListItem>
      ),
    },
    renderText: (text: string) => text.replace('!', '?'),
  };
  return documentToReactComponents(richTextDocument, options);
};

export default ContentfulRenderer;
