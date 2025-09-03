import React, { useState, useEffect } from 'react';
import { TrendingUp, Building2, Users, DollarSign, Calendar, Target, LayoutGrid, List, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, User, MapPin, Award, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type StartupData = Database['public']['Tables']['aug_data_total_break']['Row'];

const TrackingStartups: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState<string>('stt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStartup, setSelectedStartup] = useState<StartupData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'students'>('overview');
  const navigate = useNavigate();

  const ROWS_PER_PAGE = 20;
  const GRID_ITEMS_PER_PAGE = 16; // 4 rows x 4 columns

  const handleStartCampaign = () => {
    navigate('/create-campaign');
  };
  
  useEffect(() => {
    fetchStartups();
  }, [currentPage, sortField, sortDirection]);

  // Calculate pagination for grid view
  const getGridPagination = () => {
    const totalGridPages = Math.ceil(totalRecords / GRID_ITEMS_PER_PAGE);
    const from = (currentPage - 1) * GRID_ITEMS_PER_PAGE;
    const to = Math.min(from + GRID_ITEMS_PER_PAGE - 1, totalRecords - 1);
    
    return {
      totalGridPages,
      from,
      to,
      currentGridPage: currentPage,
      hasNextPage: currentPage < totalGridPages,
      hasPrevPage: currentPage > 1
    };
  };

    const fetchStartups = async () => {
    try {
      setLoading(true);
      
      // First, get total count
      const { count, error: countError } = await supabase
        .from('aug_data_total_break')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching count:', countError);
        return;
      }

      setTotalRecords(count || 0);
      const itemsPerPage = viewMode === 'grid' ? GRID_ITEMS_PER_PAGE : ROWS_PER_PAGE;
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      let { data, error } = await supabase
        .from('aug_data_total_break')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) {
        console.error('Error fetching startups:', error);
        return;
      }

      // Sort data to prioritize items with image links first for grid view
      if (data && viewMode === 'grid') {
        data = data.sort((a, b) => {
          const aHasImage = a.link_hinh_anh && a.link_hinh_anh.includes('drive.google.com');
          const bHasImage = b.link_hinh_anh && b.link_hinh_anh.includes('drive.google.com');
          
          // Prioritize cards with Google Drive images first
          if (aHasImage && !bHasImage) return -1;
          if (!aHasImage && bHasImage) return 1;
          
          // If both have images or both don't have images, maintain original order
          return 0;
        });
      }

      // Apply pagination after sorting
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage;
      const paginatedData = data ? data.slice(from, to) : [];

             setStartups(paginatedData);
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-going':
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (startup: StartupData) => {
    // Simple progress calculation based on completion status
    if (startup.ket_qua) return 100;
    if (startup.gia_tri_giai_thuong) return 75;
    if (startup.mo_ta) return 50;
    return 25;
  };

  const DEFAULT_IMAGE_URL = 'https://n8nskilluptest.s3.ap-southeast-1.amazonaws.com/vlic_mockimage.webp';
  
  // Fallback to a reliable placeholder if S3 image fails
  const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTEwSDI1MFYxOTBIMTUwVjExMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHA+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvamVjdCBJbWFnZTwvdGV4dD48L3A+Cjwvc3ZnPgo=';

  const formatImageUrl = (url: string | null) => {
    if (!url) return DEFAULT_IMAGE_URL;
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      // Convert Google Drive sharing URL to direct image URL
      if (url.includes('/file/d/')) {
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        if (fileId) {
          // Try using the original URL with a different approach
          const directUrl = url.replace('/view?usp=drive_link', '/preview');
          console.log('Converting Google Drive URL:', { original: url, fileId, directUrl });
          return directUrl;
        }
      }
      // If it's already a direct Google Drive URL, return as is
      if (url.includes('thumbnail?id=') || url.includes('uc?export=view')) {
        return url;
      }
    }
    
    console.log('Using original URL:', url);
    return url;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as sort field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleViewDetails = (startup: StartupData) => {
    setSelectedStartup(startup);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedStartup(null);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-3 w-3 text-gray-400" />
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col">
        {sortDirection === 'asc' ? (
          <ChevronUp className="h-3 w-3 text-blue-600" />
        ) : (
          <ChevronUp className="h-3 w-3 text-gray-400" />
        )}
        {sortDirection === 'desc' ? (
          <ChevronDown className="h-3 w-3 text-blue-600" />
        ) : (
          <ChevronDown className="h-3 w-3 text-gray-400" />
        )}
      </div>
    );
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
            i === currentPage
              ? 'z-10 bg-red-50 border-red-500 text-red-600'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    );

    return pages;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tracking Startups</h1>
              <p className="text-gray-600 mt-1">
                Monitor startup progress and milestones
              </p>
            </div>
          </div>
          <Button 
            onClick={handleStartCampaign}
            className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full text-sm"
          >
            Start a Campaign
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading startup data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tracking Startups</h1>
            <p className="text-gray-600 mt-1">
              Monitor startup progress and milestones
            </p>
          </div>
        </div>
        <Button 
          onClick={handleStartCampaign}
          className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full text-sm"
        >
          Start a Campaign
        </Button>
             </div>

       {/* Tabs Navigation */}
       <div className="border-b border-gray-200 mb-6">
         <nav className="-mb-px flex space-x-8">
           <button
             onClick={() => setActiveTab('overview')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'overview'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Overview
           </button>
           <button
             onClick={() => setActiveTab('achievements')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'achievements'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Top Achievements
           </button>
           <button
             onClick={() => setActiveTab('students')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'students'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Outstanding students
           </button>
         </nav>
       </div>

       {/* Tab Content */}
       {activeTab === 'overview' && (
         <>
           {/* View Toggle */}
           <div className="flex justify-end mb-4">
             <div className="inline-flex rounded-md shadow-sm -space-x-px">
               <button
                 onClick={() => setViewMode('grid')}
                 className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                   viewMode === 'grid' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                 }`}
               >
                 <LayoutGrid className="h-5 w-5 mr-2" />
                 Grid
               </button>
               <button
                 onClick={() => setViewMode('table')}
                 className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                   viewMode === 'table' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                 }`}
               >
                 <List className="h-5 w-5 mr-2" />
                 List
               </button>
             </div>
           </div>
         </>
       )}

             {/* Conditional Rendering based on viewMode */}
       {activeTab === 'overview' && (
         viewMode === 'grid' ? (
         // Grid View with Pagination
         <div className="space-y-6">
           

           {/* Grid Layout - 4x4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {startups.map((startup) => {
               const progress = calculateProgress(startup);
               const fullName = `${startup.ho_ten_lot || ''} ${startup.ten || ''}`.trim();
               
               return (
                 <div key={startup.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                       {/* Project Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {startup.link_hinh_anh && startup.link_hinh_anh.includes('drive.google.com') ? (
                        <iframe
                          src={startup.link_hinh_anh.replace('/view?usp=drive_link', '/preview')}
                          className="w-full h-full object-cover"
                          frameBorder="0"
                          allowFullScreen
                          title={startup.ten_de_tai || 'Project Image'}
                        />
                      ) : (
                        <img
                          src={formatImageUrl(startup.link_hinh_anh)}
                          alt={startup.ten_de_tai || 'Project Image'}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.log('Image failed to load, using fallback:', startup.link_hinh_anh);
                            // Try the default S3 image first, then fallback to SVG placeholder
                            if (target.src !== DEFAULT_IMAGE_URL) {
                              target.src = DEFAULT_IMAGE_URL;
                            } else {
                              target.src = FALLBACK_IMAGE_URL;
                            }
                          }}
                          onLoad={(e) => {
                            // Log successful image loads for debugging
                            console.log('Image loaded successfully:', startup.link_hinh_anh);
                          }}
                          loading="lazy"
                        />
                      )}
                      
                     {/* Status Badge Overlay */}
                     <div className="absolute top-3 right-3">
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(startup.status)}`}>
                         {startup.status || 'Unknown'}
                </span>
              </div>
                   </div>
                   
                   <div className="p-6">
                     <div className="mb-4">
                       <h3 className="text-lg font-semibold text-gray-900 truncate" title={startup.ten_de_tai || 'Untitled'}>
                         {startup.ten_de_tai || 'Untitled'}
                       </h3>
                     </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-600">Program:</span>
                         <span className="font-medium text-gray-900 truncate" title={startup.ten_chuong_trinh || 'N/A'}>
                           {startup.ten_chuong_trinh || 'N/A'}
                         </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-600">Leader:</span>
                         <span className="font-medium text-gray-900 truncate" title={fullName}>
                           {fullName || 'N/A'}
                         </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-600">Field:</span>
                         <span className="font-medium text-gray-900 truncate" title={startup.linh_vuc || 'N/A'}>
                           {startup.linh_vuc || 'N/A'}
                         </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">{startup.nam_hoc || 'N/A'}</span>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(startup)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
                 </div>
               );
             })}
           </div>

           {/* Grid Pagination */}
           {totalPages > 1 && (
             <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
               <div className="flex-1 flex justify-between sm:hidden">
                 <button
                   onClick={() => handlePageChange(currentPage - 1)}
                   disabled={currentPage === 1}
                   className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Previous
                 </button>
                 <button
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage === totalPages}
                   className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Next
                 </button>
               </div>
               <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                 <div>
                                       <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * GRID_ITEMS_PER_PAGE) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * GRID_ITEMS_PER_PAGE, totalRecords)}</span> of{' '}
                      <span className="font-medium">{totalRecords}</span> results ({startups.length} items)
                    </p>
                 </div>
                 <div>
                   <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                     {renderPagination()}
                   </nav>
                 </div>
               </div>
             </div>
           )}
        </div>
      ) : (
        // Table View with Pagination
        <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Startup Progress</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1} to {Math.min(currentPage * ROWS_PER_PAGE, totalRecords)} of {totalRecords} results
              </p>
          </div>
            
                        {/* Responsive table */}
          <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       <button 
                         onClick={() => handleSort('stt')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         STT
                         {getSortIcon('stt')}
                       </button>
                     </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       <button 
                         onClick={() => handleSort('ten_de_tai')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                    Startup
                         {getSortIcon('ten_de_tai')}
                       </button>
                     </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                       <button 
                         onClick={() => handleSort('ten_chuong_trinh')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Program
                         {getSortIcon('ten_chuong_trinh')}
                       </button>
                  </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                       <button 
                         onClick={() => handleSort('ten')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Leader
                         {getSortIcon('ten')}
                       </button>
                  </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                       <button 
                         onClick={() => handleSort('khoa')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Khoa
                         {getSortIcon('khoa')}
                       </button>
                  </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                       <button 
                         onClick={() => handleSort('truong')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Trường
                         {getSortIcon('truong')}
                       </button>
                  </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                       <button 
                         onClick={() => handleSort('linh_vuc')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Field
                         {getSortIcon('linh_vuc')}
                       </button>
                  </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                       <button 
                         onClick={() => handleSort('nam_hoc')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Year
                         {getSortIcon('nam_hoc')}
                       </button>
                  </th>
                     <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       <button 
                         onClick={() => handleSort('status')}
                         className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                       >
                         Status
                         {getSortIcon('status')}
                       </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {startups.map((startup) => {
                    const fullName = `${startup.ho_ten_lot || ''} ${startup.ten || ''}`.trim();
                    
                                         return (
                       <tr 
                         key={startup.id} 
                         className="hover:bg-gray-50 cursor-pointer"
                         onClick={() => handleViewDetails(startup)}
                       >
                         <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                           {startup.stt}
                         </td>
                                                 <td className="px-3 py-4">
                           <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate leading-relaxed" title={startup.ten_de_tai || 'Untitled'}>
                             {startup.ten_de_tai || 'Untitled'}
                           </div>
                    </td>
                                                 <td className="px-3 py-4 text-sm text-gray-900 max-w-[150px] truncate hidden lg:table-cell leading-relaxed" title={startup.ten_chuong_trinh || 'N/A'}>
                           {startup.ten_chuong_trinh || 'N/A'}
                    </td>
                         <td className="px-3 py-4 text-sm text-gray-900 max-w-[120px] truncate hidden md:table-cell leading-relaxed" title={fullName}>
                           {fullName || 'N/A'}
                    </td>
                                                 <td className="px-3 py-4 text-sm text-gray-900 max-w-[100px] truncate hidden xl:table-cell leading-relaxed" title={startup.khoa || 'N/A'}>
                           {startup.khoa || 'N/A'}
                    </td>
                         <td className="px-3 py-4 text-sm text-gray-900 max-w-[100px] truncate hidden xl:table-cell leading-relaxed" title={startup.truong || 'N/A'}>
                           {startup.truong || 'N/A'}
                    </td>
                         <td className="px-3 py-4 text-sm text-gray-900 max-w-[100px] truncate hidden lg:table-cell leading-relaxed" title={startup.linh_vuc || 'N/A'}>
                           {startup.linh_vuc || 'N/A'}
                    </td>
                        <td className="px-3 py-4 hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                            {startup.nam_hoc || 'N/A'}
                      </div>
                    </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(startup.status)}`}>
                            {startup.status || 'Unknown'}
                          </span>
                        </td>
                  </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * ROWS_PER_PAGE) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * ROWS_PER_PAGE, totalRecords)}</span> of{' '}
                    <span className="font-medium">{totalRecords}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {renderPagination()}
                  </nav>
                </div>
              </div>
            </div>
          )}
                 </div>
       )
       )}

       {/* Project Details Modal */}
       {showDetailsModal && selectedStartup && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
               <button
                 onClick={closeDetailsModal}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>

             {/* Modal Content */}
             <div className="p-6">
               {/* Project Image */}
               <div className="mb-6">
                 <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                   {selectedStartup.link_hinh_anh && selectedStartup.link_hinh_anh.includes('drive.google.com') ? (
                     <iframe
                       src={selectedStartup.link_hinh_anh.replace('/view?usp=drive_link', '/preview')}
                       className="w-full h-full"
                       frameBorder="0"
                       allowFullScreen
                       title={selectedStartup.ten_de_tai || 'Project Image'}
                     />
                   ) : (
                     <img
                       src={formatImageUrl(selectedStartup.link_hinh_anh)}
                       alt={selectedStartup.ten_de_tai || 'Project Image'}
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         console.log('Modal image failed to load, using fallback:', selectedStartup.link_hinh_anh);
                         // Try the default S3 image first, then fallback to SVG placeholder
                         if (target.src !== DEFAULT_IMAGE_URL) {
                           target.src = DEFAULT_IMAGE_URL;
                         } else {
                           target.src = FALLBACK_IMAGE_URL;
                         }
                       }}
                     />
                   )}
                   <div className="absolute top-4 right-4">
                     <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(selectedStartup.status)}`}>
                       {selectedStartup.status || 'Unknown'}
                     </span>
                   </div>
                 </div>
               </div>

               {/* Project Information Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Basic Information */}
                 <div className="space-y-4">
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Project Information</h3>
                     <div className="space-y-3">
                       <div className="flex items-start">
                         <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Project Title</p>
                           <p className="text-gray-900">{selectedStartup.ten_de_tai || 'N/A'}</p>
                         </div>
                       </div>
                       <div className="flex items-start">
                         <Award className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Program</p>
                           <p className="text-gray-900">{selectedStartup.ten_chuong_trinh || 'N/A'}</p>
                         </div>
                       </div>
                       <div className="flex items-start">
                         <User className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Leader</p>
                           <p className="text-gray-900">{`${selectedStartup.ho_ten_lot || ''} ${selectedStartup.ten || ''}`.trim() || 'N/A'}</p>
                         </div>
                       </div>
                       <div className="flex items-start">
                         <MapPin className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Field</p>
                           <p className="text-gray-900">{selectedStartup.linh_vuc || 'N/A'}</p>
                         </div>
                       </div>
                       <div className="flex items-start">
                         <Calendar className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Academic Year</p>
                           <p className="text-gray-900">{selectedStartup.nam_hoc || 'N/A'}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Additional Information */}
                 <div className="space-y-4">
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Additional Details</h3>
                     <div className="space-y-3">
                       <div>
                         <p className="text-sm font-medium text-gray-500">Faculty</p>
                         <p className="text-gray-900">{selectedStartup.khoa || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-500">School</p>
                         <p className="text-gray-900">{selectedStartup.truong || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-500">Description</p>
                         <p className="text-gray-900">{selectedStartup.mo_ta || 'No description available'}</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-500">Results</p>
                         <p className="text-gray-900">{selectedStartup.ket_qua || 'No results available'}</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-500">Prize Value</p>
                         <p className="text-gray-900">{selectedStartup.gia_tri_giai_thuong ? formatCurrency(selectedStartup.gia_tri_giai_thuong) : 'N/A'}</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Modal Footer */}
             <div className="flex justify-end p-6 border-t border-gray-200">
               <Button
                 onClick={closeDetailsModal}
                 variant="outline"
                 className="mr-2"
               >
                 Close
               </Button>
             </div>
           </div>
         </div>
       )}

       {/* Top Achievements Tab */}
       {activeTab === 'achievements' && (
         <div className="space-y-6">
           <div className="bg-white rounded-lg border border-gray-200 p-6">
             <h2 className="text-xl font-bold text-gray-900 mb-4">Top Achievements</h2>
             <p className="text-gray-600">Highlighting the most successful startup projects and their achievements</p>
           </div>

           {/* Top Achievements Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         {/* Card 1: UNIFUND */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="relative h-48 bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">UNIFUND</div>
                  <div className="text-sm opacity-90">Community Funding Platform</div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">FinTech</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">UNIFUND</h3>
                  <p className="text-sm text-gray-600 mb-4">Nền tảng huy động vốn cộng đồng trực tuyến</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Students:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Vũ Châu Anh</li>
                        <li>• Lý Tấn Lộc</li>
                        <li>• Ngô Hoàng Tú Anh</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Department:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• PR</li>
                        <li>• Fine Arts & Design</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Achievements:</p>
                    <ul className="text-sm text-gray-900 space-y-1">
                      <li>• Giải khuyến khích RA KHƠI 2024</li>
                      <li>• Top 15 Zone BoothCamp 2025</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm font-medium">On-going</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: SELF */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">SELF</div>
                  <div className="text-sm opacity-90">Educational Technology</div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">EduTech</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SELF</h3>
                  <p className="text-sm text-gray-600 mb-4">Ứng dụng giáo dục dành cho trẻ tự kỷ</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Students:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Trần Nhật Khôi</li>
                        <li>• Đỗ Bảo Lộc</li>
                        <li>• Lý Tấn Lộc</li>
                        <li>• Trần Phương Trinh</li>
                        <li>• Viên Thị Thanh Trúc</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Department:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Quản trị kinh doanh</li>
                        <li>• Xã hội & Nhân văn</li>
                        <li>• Mỹ thuật & Thiết kế</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Achievements:</p>
                    <ul className="text-sm text-gray-900 space-y-1">
                      <li>• Giải nhất RA KHƠI 2025</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm font-medium">On-going</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: SÁNG TẠO XANH */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="relative h-48 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">SÁNG TẠO XANH</div>
                  <div className="text-sm opacity-90">Green Innovation</div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">GreenTech</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SÁNG TẠO XANH</h3>
                  <p className="text-sm text-gray-600 mb-4">Hộp đựng thực phẩm từ thân chuối</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Students:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Lâm Gia Bảo</li>
                        <li>• Nguyễn Ngọc Hạ</li>
                        <li>• Lê Phúc An</li>
                        <li>• Nguyễn Như Ý</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Department:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Quản trị kinh doanh</li>
                        <li>• Quan hệ công chúng</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Achievements:</p>
                    <ul className="text-sm text-gray-900 space-y-1">
                      <li>• Giải khán giả bình chọn RA KHƠI 2025</li>
                      <li>• Giải khuyến khích RA KHƠI 2025</li>
                      <li>• Top 20 UNIV. STAR 2025</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm font-medium">On-going</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: YUUMI */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="relative h-48 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">YUUMI</div>
                  <div className="text-sm opacity-90">Smart Health Assistant</div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">MedTech</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">YUUMI</h3>
                  <p className="text-sm text-gray-600 mb-4">Trợ lý sức khỏe thông minh</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Students:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Nguyễn Lê Anh Tuấn</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Department:</p>
                      <ul className="text-sm text-gray-900 space-y-1">
                        <li>• Quan hệ công chúng</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Achievements:</p>
                    <ul className="text-sm text-gray-900 space-y-1">
                      <li>• Giải Nhất HIU Startup 2024</li>
                      <li>• Giải Khuyến khích I'm Possible - Bệ phóng khởi nghiệp 2023</li>
                      <li>• Giải Khuyến khích cuộc thi Startup Challenge 2023</li>
                      <li>• Vinh danh Top 100 Startup Wheel 2024</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm font-medium">On-going</span>
                  </div>
                </div>
              </div>
            </div>
           </div>
         </div>
       )}

       {/* Outstanding Students Tab */}
       {activeTab === 'students' && (
         <div className="space-y-6">
           <div className="bg-white rounded-lg border border-gray-200 p-6">
             <h2 className="text-xl font-bold text-gray-900 mb-4">Outstanding Students</h2>
             <p className="text-gray-600">Highlighting students who have demonstrated exceptional academic performance and project contributions.</p>
           </div>

           {/* Outstanding Students Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Student Card 1 */}
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
               <div className="relative h-48 bg-gray-100 overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                   alt="Võ Quốc Sỹ" 
                   className="w-full h-full object-cover object-center" 
                 />
                 <div className="absolute top-2 left-2 bg-white p-1 rounded-full shadow-md">
                   <Award className="h-5 w-5 text-yellow-500" />
                 </div>
               </div>
               <div className="p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Võ Quốc Sỹ</h3>
                 <div className="space-y-1 text-sm text-gray-700">
                   <p><span className="font-medium">MSSV:</span> 12345678</p>
                   <p><span className="font-medium">Khoa:</span> Công nghệ thông tin</p>
                   <p><span className="font-medium">Ngành:</span> Kỹ thuật phần mềm</p>
                   <p><span className="font-medium">Dự án:</span> Phát triển ứng dụng di động</p>
                   <p><span className="font-medium">Thành tựu:</span> Giải ba cuộc thi lập trình sinh viên</p>
                 </div>
               </div>
             </div>

             {/* Student Card 2 */}
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
               <div className="relative h-48 bg-gray-100 overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                   alt="Võ Quốc Sỹ" 
                   className="w-full h-full object-cover object-center" 
                 />
                 <div className="absolute top-2 left-2 bg-white p-1 rounded-full shadow-md">
                   <Award className="h-5 w-5 text-yellow-500" />
                 </div>
               </div>
               <div className="p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Võ Quốc Sỹ</h3>
                 <div className="space-y-1 text-sm text-gray-700">
                   <p><span className="font-medium">MSSV:</span> 87654321</p>
                   <p><span className="font-medium">Khoa:</span> Quản trị kinh doanh</p>
                   <p><span className="font-medium">Ngành:</span> Marketing</p>
                   <p><span className="font-medium">Dự án:</span> Chiến dịch quảng bá sản phẩm</p>
                   <p><span className="font-medium">Thành tựu:</span> Sinh viên xuất sắc năm học 2023-2024</p>
                 </div>
               </div>
             </div>

             {/* Student Card 3 */}
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
               <div className="relative h-48 bg-gray-100 overflow-hidden">
                 <img 
                   src="https://ix-marketing.imgix.net/about-us_kunal2.png?auto=format,compress&w=1946" 
                   alt="Võ Quốc Sỹ" 
                   className="w-full h-full object-cover object-center" 
                 />
                 <div className="absolute top-2 left-2 bg-white p-1 rounded-full shadow-md">
                   <Award className="h-5 w-5 text-yellow-500" />
                 </div>
               </div>
               <div className="p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Võ Quốc Sỹ</h3>
                 <div className="space-y-1 text-sm text-gray-700">
                   <p><span className="font-medium">MSSV:</span> 11223344</p>
                   <p><span className="font-medium">Khoa:</span> Mỹ thuật & Thiết kế</p>
                   <p><span className="font-medium">Ngành:</span> Thiết kế đồ họa</p>
                   <p><span className="font-medium">Dự án:</span> Thiết kế bộ nhận diện thương hiệu</p>
                   <p><span className="font-medium">Thành tựu:</span> Giải nhất cuộc thi thiết kế trẻ</p>
                 </div>
               </div>
             </div>

             {/* Student Card 4 */}
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
               <div className="relative h-48 bg-gray-100 overflow-hidden">
                 <img 
                   src="https://ix-marketing.imgix.net/aboutus-card-video-chris.png?auto=format,compress&w=1946" 
                   alt="Võ Quốc Sỹ" 
                   className="w-full h-full object-cover object-center" 
                 />
                 <div className="absolute top-2 left-2 bg-white p-1 rounded-full shadow-md">
                   <Award className="h-5 w-5 text-yellow-500" />
                 </div>
               </div>
               <div className="p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Võ Quốc Sỹ</h3>
                 <div className="space-y-1 text-sm text-gray-700">
                   <p><span className="font-medium">MSSV:</span> 44332211</p>
                   <p><span className="font-medium">Khoa:</span> Xã hội & Nhân văn</p>
                   <p><span className="font-medium">Ngành:</span> Quan hệ công chúng</p>
                   <p><span className="font-medium">Dự án:</span> Tổ chức sự kiện cộng đồng</p>
                   <p><span className="font-medium">Thành tựu:</span> Trưởng ban tổ chức sự kiện lớn của trường</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default TrackingStartups;
