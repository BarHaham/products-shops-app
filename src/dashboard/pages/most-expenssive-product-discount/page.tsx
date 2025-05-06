import React, { useEffect, useState } from 'react';
import {
  WixDesignSystemProvider,
  Card,
  Text,
  Loader,
  Button,
  Box,
  Input,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { products } from '@wix/stores';

const ProductDiscountPage = () => {
  const [product, setProduct] = useState<products.Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [discountValue, setDiscountValue] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostExpensiveProduct = async () => {
      try {
        const response = await products.queryProducts().find();
        const productsList = response.items;

        const nonDiscounted = productsList.filter((item) => {
          if (!item.priceData || item.priceData.price == null) return false;
          const hasDiscount =
            item.priceData.discountedPrice != null &&
            item.priceData.discountedPrice < item.priceData.price;
          return !hasDiscount;
        });

        if (nonDiscounted.length === 0) {
          setMessage('No non-discounted products found.');
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
        setMessage('Failed to load product.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostExpensiveProduct();
  }, []);

  const applyDiscount = async () => {
    if (!product || !discountValue) {
      setMessage('⚠️ Please enter a discount.');
      return;
    }

    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount <= 0 || discount >= 100) {
      setMessage('⚠️ Please enter a valid discount percentage (1-99).');
      return;
    }

    try {
      const originalPrice = product.priceData?.price || 0;
      const newPrice = originalPrice - (originalPrice * discount) / 100;

      await products.updateProduct(product._id!, {
        priceData: {
          ...product.priceData,
          discountedPrice: newPrice,
        },
      });

      setMessage('✅ Discount applied successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to apply discount.');
    }
  };

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Box height="100vh" display="flex" align="center" direction="vertical" padding="SP6" width="100%">
        <Box width="100%" maxWidth="1000px">
          <Card>
            <Card.Header
              title="🎯 Product Discounter"
              subtitle="🚀 Give people a break on your most expensive product."
            />
            <Card.Divider />
            <Card.Content>
              {isLoading ? (
                <Box align="center" padding="SP4">
                  <Loader />
                </Box>
              ) : !product ? (
                <Text>{message}</Text>
              ) : (
                <Box direction="vertical" gap="SP6" width="100%">
                  <Box align="center" direction="vertical" gap="SP2">
                    <Text weight="bold" size="medium" color="primary">
                      Most expensive product
                    </Text>
                    <Text color="secondary" align="center">
                      This is the most expensive product that is not already discounted.
                    </Text>
                  </Box>

                  <Box direction="horizontal" gap="SP10" align="center" width="100%">
                    <Box width="40%">
                      {product.media?.mainMedia?.image?.url && (
                        <img
                          src={product.media.mainMedia.image.url}
                          alt={product.name || 'Product Image'}
                          style={{
                            width: '100%',
                            borderRadius: '12px',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </Box>

                    <Box direction="vertical" gap="SP4" width="60%">
                      <Text weight="bold">🛒 {product.name}</Text>
                      <Text>
                        💰 {product.priceData?.price} {product.priceData?.currency}
                      </Text>
                      <Box direction="vertical" gap="SP2">
                        <Text>Discount %</Text>
                        <Box width="100%" maxWidth="400px">
                          <Input
                            placeholder="Enter discount"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                          />
                        </Box>
                      </Box>
                      <Button onClick={applyDiscount}>Apply Discount ✨</Button>
                      {message && (
                        <Text marginTop="SP3" color="secondary">
                          {message}
                        </Text>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Card.Content>
          </Card>
        </Box>
      </Box>
    </WixDesignSystemProvider>
  );
};

export default ProductDiscountPage;
