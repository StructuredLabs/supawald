import { Components } from 'react-markdown'

export const markdownComponents: Components = {
  h1: ({node, ...props}) => <h1 {...props} />,
  h2: ({node, ...props}) => <h2 {...props} />,
  h3: ({node, ...props}) => <h3 {...props} />,
  p: ({node, ...props}) => <p {...props} />,
  ul: ({node, ...props}) => <ul {...props} />,
  ol: ({node, ...props}) => <ol {...props} />,
  li: ({node, ...props}) => <li {...props} />,
  blockquote: ({node, ...props}) => <blockquote {...props} />,
  code: ({node, inline, className, ...props}: {node?: any; inline?: boolean; className?: string}) => 
    inline ? 
      <code {...props} /> :
      <code {...props} />,
  pre: ({node, ...props}) => <pre {...props} />,
  img: ({node, ...props}) => <img {...props} />,
  a: ({node, ...props}) => <a {...props} />,
  table: ({node, ...props}) => <table {...props} />,
  th: ({node, ...props}) => <th {...props} />,
  td: ({node, ...props}) => <td {...props} />,
  hr: ({node, ...props}) => <hr {...props} />,
  strong: ({node, ...props}) => <strong {...props} />,
  em: ({node, ...props}) => <em {...props} />
} 