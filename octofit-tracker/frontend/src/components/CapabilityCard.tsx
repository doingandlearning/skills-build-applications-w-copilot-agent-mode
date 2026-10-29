import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<Response, Item> = {
  title: string;
  description: string;
  path: string;
  select: (response: Response) => Item[];
  emptyText: string;
  renderItem: (item: Item) => string;
};

type State<Item> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; items: Item[] };

export function CapabilityCard<Response, Item>({ title, description, path, select, emptyText, renderItem }: Props<Response, Item>) {
  const [state, setState] = useState<State<Item>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<Response>(path)
      .then((response) => active && setState({ status: 'ready', items: select(response) }))
      .catch((error: Error) => active && setState({ status: 'error', message: error.message }));
    return () => { active = false; };
    // select is a stable module-level function in each caller.
  }, [path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}…</p>}
        {state.status === 'error' && <p role="alert" className="text-danger">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'ready' && state.items.length === 0 && <p role="status">{emptyText}</p>}
        {state.status === 'ready' && state.items.length > 0 && (
          <ul className="list-group">
            {state.items.map((item, index) => <li key={index} className="list-group-item">{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
