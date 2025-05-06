import React, { type FC, useEffect, useState } from 'react';
import {
  WixDesignSystemProvider,
  Card,
  Text,
  Loader,
  Button,
  Box,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { products } from '@wix/stores';

type Product = products.Product;

const Plugin: FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostExpensiveProduct = async () => {
            try {
        const response = await products.queryProducts().find();
        const productsList = response.items;
        if (!productsList || productsList.length === 0) {
          setError('No products found.');
          setIsLoading(false);
          return;
        }
        const nonDiscounted = productsList.filter((item) => {
          if (!item.priceData || item.priceData.price == null) return false;
          const hasDiscount =
            item.priceData.discountedPrice != null &&
            item.priceData.discountedPrice < item.priceData.price;
          return !hasDiscount;
        });
        if (nonDiscounted.length === 0) {
          setError('No non-discounted products found.');
          setIsLoading(false);
          return;
        }
        const mostExpensive = nonDiscounted.reduce((max, item) =>
          (item.priceData?.price || 0) > (max.priceData?.price || 0)
            ? item
            : max
        );
        setProduct(mostExpensive);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostExpensiveProduct();
  }, []);

  const discountPageUrl =
    'https://manage.wix.com/dashboard/b8bf27b3-dc00-49b3-8939-8dbeedc9d257/app/858fdc50-c2ee-4aba-81fe-06599ae55685/most-expenssive-product-discount?apps-override=8d879c7cd0104268b9fccf93d79265cb&referralInfo=sidebar';

  return (
    <div style={{ overflow: 'hidden' }}>
      <WixDesignSystemProvider features={{ newColorsBranding: true }}>
        <Card>
          <Card.Header title="Most Expensive Product" />
          <Card.Divider />
          <Card.Content size="medium">
            <Box>
              {isLoading ? (
                <Loader />
              ) : error ? (
                <Text>{error}</Text>
              ) : product ? (
                <Box
                  direction="horizontal"
                  gap="SP4"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    width: '100%',
                  }}
                >
                  {/* Product Image */}
                  {product.media?.mainMedia?.image?.url && (
                    <img
                      src={product.media.mainMedia.image.url}
                      alt={product.name || 'Product Image'}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {/* Product Info */}
                  <Box
                    direction="vertical"
                    gap="SP2"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Text weight="bold" size="medium">
                      {product.name}
                    </Text>
                    <Text size="small">
                      {product.priceData?.price} {product.priceData?.currency}
                    </Text>
                    <a href={discountPageUrl} target="_top" style={{ textDecoration: 'none' }}>
                      <Button size="small">Go to Discount Page</Button>
                    </a>
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Card.Content>
        </Card>
      </WixDesignSystemProvider>
    </div>
  );
};

export default Plugin;