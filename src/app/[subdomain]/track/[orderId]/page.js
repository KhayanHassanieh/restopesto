import { use } from 'react';

export default function Page({ params }) {
  const { orderId } = use(params);

  return (
    <div>
      <p>Order ID: {orderId}</p>
    </div>
  );
}
