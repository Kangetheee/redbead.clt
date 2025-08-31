"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, Tag, Package } from "lucide-react";
import { Input } from "../../ui/input";
import { useSearchProducts } from "@/hooks/use-products";
// import { ProductResponse } from "@/lib/products/types/products.types";
import { formatCurrency } from "@/lib/utils";

export default function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the search products hook
  const { data: searchResults, isLoading: isSearching } = useSearchProducts(
    { q: searchTerm, limit: 5 },
    searchTerm.length >= 2
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  // TODO: handle select by slugs
  //   eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleProductSelect(productId: string, productSlug: string) {
    setSearchTerm("");
    setIsOpen(false);
    router.push(`/products/${productId}`);
  }

  // // Helper function to get valid image URL
  // const getValidImageUrl = (
  //   product: ProductResponse,
  //   fallback = "/placeholder-product.jpg"
  // ) => {
  //   if (product.thumbnailImage) return product.thumbnailImage;
  //   if (product.images && product.images.length > 0) return product.images[0];
  //   return fallback;
  // };

  return (
    <div className="relative w-full flex-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search products..."
          className="w-full appearance-none bg-background pl-8 shadow-none"
        />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full max-h-[450px] overflow-auto rounded-md bg-background border shadow-lg md:w-2/3 lg:w-1/3"
        >
          {isSearching ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Searching products...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <ul className="py-1">
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductSelect(product.id, product.slug)}
                  className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center gap-3"
                >
                  {/* Product thumbnail */}
                  <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {/* <Image
                      src={getValidImageUrl(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-product.jpg";
                      }}
                    /> */}
                  </div>

                  {/* Product info */}
                  <div className="flex-grow min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {formatCurrency(product.basePrice)}
                      </span>

                      {product.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {product.category.name}
                        </span>
                      )}

                      {product.variants && product.variants.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {product.variants.length} variant
                          {product.variants.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status indicators */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    {!product.isActive && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-destructive/20 text-destructive">
                        Inactive
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Featured
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              {searchTerm.trim().length >= 2
                ? "No products found"
                : "Type at least 2 characters to search"}
            </div>
          )}

          {/* Footer with search all option */}
          {searchTerm.trim().length >= 2 && (
            <div className="border-t p-2">
              <button
                onClick={() => {
                  router.push(
                    `/products?search=${encodeURIComponent(searchTerm)}`
                  );
                  setIsOpen(false);
                }}
                className="w-full text-center py-1.5 px-3 text-sm hover:bg-accent rounded-md transition-colors"
              >
                Search all products for &quot;{searchTerm} &quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
