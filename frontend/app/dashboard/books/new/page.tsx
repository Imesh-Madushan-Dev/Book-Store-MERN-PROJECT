'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Save,
  Eye,
  Plus,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Author {
  _id: string;
  name: string;
  slug: string;
}

interface Publisher {
  _id: string;
  name: string;
  slug: string;
}

interface BookFormData {
  title: string;
  description: string;
  isbn: string;
  authorId: string;
  publisherId: string;
  categoryId: string;
  price: number;
  originalPrice: number;
  stock: number;
  format: 'HARDCOVER' | 'PAPERBACK' | 'EBOOK' | 'AUDIOBOOK';
  language: string;
  pages: number;
  publishedYear: number;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  newRelease: boolean;
}

export default function AddBookPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    isbn: '',
    authorId: '',
    publisherId: '',
    categoryId: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    format: 'PAPERBACK',
    language: 'English',
    pages: 0,
    publishedYear: new Date().getFullYear(),
    tags: [],
    featured: false,
    bestseller: false,
    newRelease: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect non-sellers
  useEffect(() => {
    if (user && user.role !== 'SELLER') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Fetch categories, authors, and publishers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, authorsRes, publishersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/authors`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/publishers`)
        ]);

        const [categoriesData, authorsData, publishersData] = await Promise.all([
          categoriesRes.json(),
          authorsRes.json(),
          publishersRes.json()
        ]);

        setCategories(categoriesData.categories || []);
        setAuthors(authorsData.authors || []);
        setPublishers(publishersData.publishers || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof BookFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const token = localStorage.getItem('auth_token');
      
      // Debug logging
      console.log('Upload attempt:', {
        token: token ? 'Present' : 'Missing',
        userRole: user?.role,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        fileCount: files.length
      });

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', response.status, errorData);
        
        // Handle specific upload error cases
        if (response.status === 401) {
          throw new Error('You need to log in to upload images. Please refresh and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to upload images. Only sellers can upload book images.');
        } else if (response.status === 400) {
          if (errorData.message && errorData.message.includes('File too large')) {
            throw new Error('Image file is too large. Please use images under 5MB.');
          } else if (errorData.message && errorData.message.includes('Only image files')) {
            throw new Error('Please select only image files (JPG, PNG, GIF, WebP).');
          } else if (errorData.message && errorData.message.includes('Too many files')) {
            throw new Error('You can upload maximum 10 images at once.');
          } else {
            throw new Error(errorData.message || 'Invalid image files. Please check your selection.');
          }
        } else if (response.status === 500) {
          throw new Error('Server error during upload. Please try again.');
        } else {
          throw new Error(errorData.message || `Image upload failed (Error ${response.status}). Please try again.`);
        }
      }

      const data = await response.json();
      
      // Add new images to existing ones
      setImages(prev => [...prev, ...data.urls]);
      
      // Set first uploaded image as thumbnail if no thumbnail set
      if (!thumbnail && data.urls.length > 0) {
        setThumbnail(data.urls[0]);
      }

      toast.success(`Uploaded ${data.urls.length} image(s)`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // If removed image was thumbnail, set new thumbnail
    if (thumbnail === imageToRemove) {
      setThumbnail(images.length > 1 ? images.find(img => img !== imageToRemove) || '' : '');
    }
  };

  const setAsThumnail = (imageUrl: string) => {
    setThumbnail(imageUrl);
    toast.success('Thumbnail updated');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      handleInputChange('tags', [...formData.tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic information validation
    if (!formData.title.trim()) {
      newErrors.title = 'Book title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Book title must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Book description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
    } else if (!/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(formData.isbn.trim())) {
      newErrors.isbn = 'Please enter a valid ISBN (10 or 13 digits)';
    }

    if (!formData.authorId) {
      newErrors.authorId = 'Please select an author';
    }
    if (!formData.publisherId) {
      newErrors.publisherId = 'Please select a publisher';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Pricing validation
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than $0';
    } else if (formData.price > 10000) {
      newErrors.price = 'Price cannot exceed $10,000';
    }

    if (formData.originalPrice > 0 && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = 'Original price must be higher than selling price';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock quantity cannot be negative';
    } else if (formData.stock > 100000) {
      newErrors.stock = 'Stock quantity cannot exceed 100,000';
    }

    // Book details validation
    if (formData.pages <= 0) {
      newErrors.pages = 'Number of pages must be greater than 0';
    } else if (formData.pages > 10000) {
      newErrors.pages = 'Number of pages cannot exceed 10,000';
    }

    const currentYear = new Date().getFullYear();
    if (formData.publishedYear < 1000) {
      newErrors.publishedYear = 'Published year cannot be before 1000';
    } else if (formData.publishedYear > currentYear + 5) {
      newErrors.publishedYear = `Published year cannot be after ${currentYear + 5}`;
    }

    // Image validation
    if (images.length === 0) {
      newErrors.images = 'Please upload at least one book image';
    }
    if (!thumbnail) {
      newErrors.thumbnail = 'Please select a thumbnail image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const bookData = {
        ...formData,
        images,
        thumbnail,
        discount: formData.originalPrice > formData.price 
          ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
          : 0
      };

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Book creation failed:', response.status, errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('You need to log in to create books. Please refresh and try again.');
        } else if (response.status === 403) {
          throw new Error('Only sellers can create books. Please check your account role.');
        } else if (response.status === 400) {
          // Handle validation errors
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(err => err.msg || err.message).join(', ');
            throw new Error(`Validation errors: ${errorMessages}`);
          } else if (errorData.message) {
            throw new Error(errorData.message);
          } else {
            throw new Error('Invalid book data. Please check all required fields.');
          }
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        } else {
          throw new Error(errorData.message || `Failed to create book (Error ${response.status})`);
        }
      }

      const data = await response.json();
      toast.success('Book created successfully!');
      router.push('/dashboard/books');
    } catch (error: any) {
      console.error('Error creating book:', error);
      toast.error(error.message || 'Failed to create book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    // For draft, we don't need all validations
    setIsLoading(true);

    try {
      const bookData = {
        ...formData,
        images,
        thumbnail,
        status: 'INACTIVE', // Draft status
        discount: formData.originalPrice > formData.price 
          ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
          : 0
      };

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Draft save failed:', response.status, errorData);
        
        // Handle specific error cases for draft saving
        if (response.status === 401) {
          throw new Error('You need to log in to save drafts. Please refresh and try again.');
        } else if (response.status === 403) {
          throw new Error('Only sellers can save book drafts. Please check your account role.');
        } else if (response.status === 400) {
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(err => err.msg || err.message).join(', ');
            throw new Error(`Validation errors: ${errorMessages}`);
          } else {
            throw new Error(errorData.message || 'Invalid draft data. Please check your form.');
          }
        } else if (response.status === 500) {
          throw new Error('Server error while saving draft. Please try again later.');
        } else {
          throw new Error(errorData.message || `Failed to save draft (Error ${response.status})`);
        }
      }

      toast.success('Book saved as draft!');
      router.push('/dashboard/books');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'SELLER') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/books">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Book</h1>
        <p className="text-muted-foreground mt-1">
          Create a new book listing for your store
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  placeholder="Enter book title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="isbn">ISBN *</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => handleInputChange('isbn', e.target.value)}
                  className={errors.isbn ? 'border-red-500' : ''}
                  placeholder="978-0-123456-78-9"
                />
                {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
                placeholder="Enter book description"
                rows={4}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="author">Author *</Label>
                <Select value={formData.authorId} onValueChange={(value) => handleInputChange('authorId', value)}>
                  <SelectTrigger className={errors.authorId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author._id} value={author._id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.authorId && <p className="text-red-500 text-xs mt-1">{errors.authorId}</p>}
              </div>

              <div>
                <Label htmlFor="publisher">Publisher *</Label>
                <Select value={formData.publisherId} onValueChange={(value) => handleInputChange('publisherId', value)}>
                  <SelectTrigger className={errors.publisherId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select publisher" />
                  </SelectTrigger>
                  <SelectContent>
                    {publishers.map((publisher) => (
                      <SelectItem key={publisher._id} value={publisher._id}>
                        {publisher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.publisherId && <p className="text-red-500 text-xs mt-1">{errors.publisherId}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book Details */}
        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="format">Format *</Label>
                <Select value={formData.format} onValueChange={(value: any) => handleInputChange('format', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAPERBACK">Paperback</SelectItem>
                    <SelectItem value="HARDCOVER">Hardcover</SelectItem>
                    <SelectItem value="EBOOK">eBook</SelectItem>
                    <SelectItem value="AUDIOBOOK">Audiobook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  placeholder="English"
                />
              </div>

              <div>
                <Label htmlFor="pages">Pages *</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages || ''}
                  onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || 0)}
                  className={errors.pages ? 'border-red-500' : ''}
                  placeholder="0"
                  min="1"
                />
                {errors.pages && <p className="text-red-500 text-xs mt-1">{errors.pages}</p>}
              </div>

              <div>
                <Label htmlFor="publishedYear">Published Year *</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => handleInputChange('publishedYear', parseInt(e.target.value) || new Date().getFullYear())}
                  className={errors.publishedYear ? 'border-red-500' : ''}
                  min="1000"
                  max={new Date().getFullYear() + 10}
                />
                {errors.publishedYear && <p className="text-red-500 text-xs mt-1">{errors.publishedYear}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Selling Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={errors.price ? 'border-red-500' : ''}
                  placeholder="0.00"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice || ''}
                  onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                  className={errors.originalPrice ? 'border-red-500' : ''}
                  placeholder="0.00"
                  min="0"
                />
                {errors.originalPrice ? (
                  <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    For showing discount percentage
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  className={errors.stock ? 'border-red-500' : ''}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>
            </div>

            {formData.originalPrice > formData.price && formData.price > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  Discount: {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% 
                  (Save ${(formData.originalPrice - formData.price).toFixed(2)})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Book Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Upload Images *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="images"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${uploadingImage ? 'opacity-50' : ''}`}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB each
                    </p>
                  </div>
                </label>
              </div>
              {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
            </div>

            {images.length > 0 && (
              <div>
                <Label>Uploaded Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                  {images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-lg border">
                        <Image
                          src={imageUrl}
                          alt={`Book image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                        {thumbnail === imageUrl && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Badge className="text-xs">Thumbnail</Badge>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {thumbnail !== imageUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setAsThumnail(imageUrl)}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Book Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="featured">Featured Book</Label>
                <p className="text-sm text-muted-foreground">
                  Show this book in featured sections
                </p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bestseller">Bestseller</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as a bestselling book
                </p>
              </div>
              <Switch
                id="bestseller"
                checked={formData.bestseller}
                onCheckedChange={(checked) => handleInputChange('bestseller', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newRelease">New Release</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as a newly released book
                </p>
              </div>
              <Switch
                id="newRelease"
                checked={formData.newRelease}
                onCheckedChange={(checked) => handleInputChange('newRelease', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating...' : 'Publish Book'}
          </Button>
        </div>
      </form>
    </div>
  );
}