import React from 'react';
import { getImageUrl } from '../../lib/imageCache';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CachedImage({ src, alt, className }: CachedImageProps) {
  const [imageSrc, setImageSrc] = React.useState<string>(src);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        setLoading(true);
        setError(false);
        const cachedUrl = await getImageUrl(src);
        if (!cancelled) {
          setImageSrc(cachedUrl);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load cached image:', src, e);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={className}>
        <Loader label="Loading image..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorMessage message="Failed to load image" />
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
} 