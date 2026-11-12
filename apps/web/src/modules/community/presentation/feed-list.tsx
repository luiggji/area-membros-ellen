import type { FeedPost } from '@caixa-forte/contracts';
import { Card } from '@caixa-forte/ui';

import { parseTimestamp } from '../domain/timestamp';

const quando = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** Uma publicação: quem escreveu, em qual grupo, quando e o texto. Comentar entra no CF-094. */
function Post({ post }: { post: FeedPost }) {
  return (
    <Card as="article" className="flex flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <p className="font-medium text-cf-text">{post.authorName}</p>
        <p className="text-sm text-cf-text-secondary">
          {post.group.name} · {quando.format(parseTimestamp(post.createdAt))}
        </p>
      </header>
      {/* `whitespace-pre-line` preserva as quebras de linha de quem escreveu, sem permitir HTML. */}
      <p className="whitespace-pre-line text-cf-text">{post.body}</p>
    </Card>
  );
}

export function FeedList({ posts }: { posts: readonly FeedPost[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li key={post.id}>
          <Post post={post} />
        </li>
      ))}
    </ul>
  );
}
