import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getProduct } from '../services/products';
import type { Product } from '../models/Product';
import { useCartStore } from '../store/cart';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import CachedImage from '../components/ui/CachedImage';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [quantity, setQuantity] = React.useState(1);
  const [addedToCart, setAddedToCart] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [tab, setTab] = React.useState<'description' | 'specs' | 'reviews'>('description');
  const addItem = useCartStore((s) => s.addItem);

  const load = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProduct(Number(id));
      setProduct(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem = useCartStore.getState().items[product.id];
      const currentInCart = cartItem?.quantity ?? 0;
      if (currentInCart + quantity > product.stock) {
        alert('You cannot add more products than what is in stock');
        return;
      }
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    }
  };

  const formatPrice = (price: number, discountPercentage: number) => {
    const discountedPrice = price - (price * discountPercentage) / 100;
    return {
      original: price.toFixed(2),
      discounted: discountedPrice.toFixed(2),
      hasDiscount: discountPercentage > 0,
    };
  };

  const getStockStatus = (stock: number, availabilityStatus: string) => {
    if (stock === 0)
      return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100', icon: CrossIcon };
    if (stock <= 5 || availabilityStatus === 'Low Stock')
      return { text: 'Low Stock', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: WarnIcon };
    return { text: 'In Stock', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckIcon };
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (error) {
    return (
      <PageChrome title="Product Details" subtitle="View and purchase product" onRefresh={load} loading={loading}>
        <ErrorMessage message={error} onRetry={load} />
      </PageChrome>
    );
  }

  if (loading || !product) {
    return (
      <PageChrome title="Product Details" subtitle="View and purchase product" onRefresh={load} loading={loading}>
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      </PageChrome>
    );
  }

  const priceInfo   = formatPrice(product.price, product.discountPercentage);
  const stockStatus = getStockStatus(product.stock, product.availabilityStatus);
  const StockIcon   = stockStatus.icon;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link to="/" className="hover:text-pink-600 transition-colors">Home</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">/</span>
            <Link to="/catalog" className="hover:text-pink-600 transition-colors">Catalog</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </li>

        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Gallery */}
        <div className="lg:col-span-6 mb-4 lg:mb-0">
          <ProductGallery
            images={product.images}
            thumbnail={product.thumbnail}
            title={product.title}
            selectedIndex={selectedImage}
            onSelect={setSelectedImage}
          />
        </div>

        {/* Product Info  */}
        <div className="lg:col-span-6">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-pink-600 font-medium">{product.brand}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 capitalize">{product.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <RatingStars rating={product.rating} reviews={product.reviews.length} />
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                <StockIcon className="w-4 h-4" />
                {stockStatus.text}
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl md:text-4xl font-bold text-pink-600">${priceInfo.discounted}</span>
              {priceInfo.hasDiscount && (
                <>
                  <span className="text-lg text-gray-500 line-through">${priceInfo.original}</span>
                  <span className="text-xs font-bold bg-rose-500 text-white px-2 py-1 rounded-full">
                    -{product.discountPercentage.toFixed(0)}%
                  </span>
                </>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed line-clamp-3">{product.description}</p>
            <div className="lg:sticky lg:top-28">
              <AddToCartCard
                id={product.id}
                stock={product.stock}
                availabilityStatus={product.availabilityStatus}
                quantity={quantity}
                setQuantity={setQuantity}
                onAdd={handleAddToCart}
                unitPrice={parseFloat(priceInfo.discounted)}
                addedToCart={addedToCart}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Description / Specifications / Reviews */}
      <section className="mt-10">
        <Tabs value={tab} onChange={setTab} items={[
          { value: 'description', label: 'Description' },
          { value: 'specs', label: 'Specifications' },
          { value: 'reviews', label: `Reviews (${product.reviews.length})` },
        ]} />

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          {tab === 'description' && (
            <div className="prose max-w-none prose-gray">
              <p className="text-gray-700 text-base leading-7">{product.description}</p>
              {product.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SpecList
                items={[
                  { k: 'SKU', v: product.sku },
                  { k: 'Weight', v: `${product.weight} g` },
                  { k: 'Brand', v: product.brand },
                  { k: 'Category', v: product.category },
                ]}
              />
              <SpecList
                items={[
                  { k: 'Warranty', v: product.warrantyInformation },
                  { k: 'Shipping', v: product.shippingInformation },
                  { k: 'Returns', v: product.returnPolicy },
                  { k: 'Barcode', v: product.meta?.barcode },
                ]}
              />
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-5">
              {product.reviews.length === 0 && (
                <p className="text-gray-600">No reviews yet.</p>
              )}
              {product.reviews.map((r, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.reviewerName} />
                      <div>
                        <div className="font-medium text-gray-900">{r.reviewerName}</div>
                        <div className="text-xs text-gray-500">{formatDate(r.date)}</div>
                      </div>
                    </div>
                    <div>
                      <RatingStars rating={r.rating} size="sm" />
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PageChrome({ title, subtitle, children, onRefresh, loading }: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {onRefresh && (
          <button
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium shadow-sm disabled:opacity-60"
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ProductGallery({
  images,
  thumbnail,
  title,
  selectedIndex,
  onSelect,
}: {
  images: string[];
  thumbnail: string;
  title: string;
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  const list    = [thumbnail, ...(images || [])];
  const current = list[selectedIndex] || thumbnail;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CachedImage
          src={current}
          alt={title}
          className="w-full h-72 md:h-[450px] object-contain p-2"
        />
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all ${
                selectedIndex === i ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Change to image ${i + 1}`}
            >
              <CachedImage src={src} alt={`${title} - ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddToCartCard({
  id,
  stock,
  quantity,
  setQuantity,
  onAdd,
  unitPrice,
  addedToCart,
}: {
  stock: number;
  quantity: number;
  setQuantity: (n: number) => void;
  onAdd: () => void;
  unitPrice: number;
  addedToCart: boolean;
}) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const disabled = stock === 0;
  const total = (unitPrice * quantity).toFixed(2);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onAdd();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-1">
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-600">Stock status</span>
        <span className="font-medium">{stock} pcs</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <div className="flex items-center">
          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 font-medium cursor-pointer"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              className="w-16 text-center py-1.5 border-0 focus:ring-0 bg-transparent cursor-text"
              min={1}
              max={stock}
              value={quantity}
              onChange={(e) => {
                const newQuantity = Math.max(1, Number(e.target.value));
                const cartItem = useCartStore.getState().items[id];
                const currentInCart = cartItem?.quantity ?? 0;
                if (currentInCart + newQuantity > stock) {
                  alert('You cannot add more products than what is in stock');
                  return;
                }
                setQuantity(newQuantity);
              }}
            />
            <button
              onClick={() => {
                const cartItem = useCartStore.getState().items[id];
                const currentInCart = cartItem?.quantity ?? 0;
                if (currentInCart + quantity >= stock) {
                  return;
                }
                setQuantity(quantity + 1);
              }}
              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 font-medium cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          disabled
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : addedToCart
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-sm cursor-pointer'
        }`}
      >
        {disabled ? (
          <>
            <CrossIcon className="w-5 h-5" />
            <span>Out of Stock</span>
          </>
        ) : addedToCart ? (
          <>
            <CheckIcon className="w-5 h-5" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <CartIcon className="w-5 h-5" />
            <span>Add to Cart - ${total}</span>
          </>
        )}
      </button>

      
    </div>
  );
}

function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string }[];
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {items.map((it) => {
          const active = value === it.value;
          return (
            <button
              key={String(it.value)}
              onClick={() => onChange(it.value)}
              className={`relative px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                active ? 'text-pink-700' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {it.label}
              <span
                className={`absolute left-0 right-0 -bottom-[1px] h-0.5 ${active ? 'bg-pink-600' : 'bg-transparent'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SpecList({ items }: { items: { k: string; v?: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
      {items.map((i, idx) => (
        <div key={idx} className="flex items-center justify-between px-4 py-3">
          <span className="text-gray-600">{i.k}</span>
          <span className="font-medium text-gray-900 text-right truncate max-w-[60%]">{i.v ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}

function RatingStars({ rating, reviews, size = 'md' }: { rating: number; reviews?: number | string; size?: 'sm' | 'md' }) {
  const rounded = Math.round(rating);
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`${cls} ${s <= rounded ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {reviews !== undefined && (
        <span className="text-sm text-gray-600">{Number(rating).toFixed(1)} ({reviews} rec.)</span>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0]?.toUpperCase();
  }, [name]);
  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
      {initials}
    </div>
  );
}

/* ---------------------------------- Ikony --------------------------------- */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}
function WarnIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
    </svg>
  );
}
