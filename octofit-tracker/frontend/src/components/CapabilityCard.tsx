import { useEffect, useState } from 'react';

type Props<Item> = {
  title: string;
  description: string;
  load: () => Promise<Item[]>;
  emptyText: string;
  renderItem: (item: Item) => string;
};

type State<Item> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; items: Item[] };

export function CapabilityCard<Item>({ title, description, load, emptyText, renderItem }: Props<Item>) {
  const [state, setState] = useState<State<Item>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load()
      .then((items) => active && setState({ status: 'ready', items }))
      .catch((error: Error) => active && setState({ status: 'error', message: error.message }));
    return () => { active = false; };
  }, [load]);

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
