import RestaurantPage from './RestaurantPage';
import { use } from 'react';

export default function Page(props) {
  const { params } = props;
  const { subdomain } = use(params);
  return <RestaurantPage subdomain={subdomain} />;
}
