import RestaurantPage from './RestaurantPage';

export default async function Page(props) {
  const { params } = props;
  return <RestaurantPage subdomain={params.subdomain} />;
}
