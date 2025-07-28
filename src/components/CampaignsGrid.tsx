
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heart, Share2, Clock, Users, MapPin, Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// Custom CSS for table optimization
const tableStyles = `
  .line-clamp-2 {
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  
  .line-clamp-3 {
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  
  .leading-tight {
    line-height: 1.25 !important;
  }
  
  /* Force table cell content to respect line-clamp */
  .table-cell-content {
    max-height: 4.5rem; /* 3 lines * 1.5 line-height */
    overflow: hidden;
  }
  
  @media (max-width: 768px) {
    .table-responsive {
      font-size: 0.875rem;
    }
  }
  
  /* Mobile table optimizations */
  @media (max-width: 640px) {
    .table-responsive {
      font-size: 0.75rem;
    }
    
    .table-cell-mobile {
      padding: 0.5rem 0.25rem !important;
    }
    
    .table-header-mobile {
      padding: 0.5rem 0.25rem !important;
      font-size: 0.75rem !important;
    }
  }
`;

const CampaignsGrid = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('Giá trị giải thưởng ');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['data_total'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_total')
        .select('*')
        .order('STT', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Sort data by selected field and direction, handle pagination
  const sortedAndPaginatedData = useMemo(() => {
    if (!campaigns) return { sortedData: [], paginatedData: [], totalPages: 0 };
    
    // Sort by selected field and direction
    const sortedData = [...campaigns].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle numeric values
      if (sortField === 'Giá trị giải thưởng ' || sortField === 'STT') {
        aValue = aValue || 0;
        bValue = bValue || 0;
        return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      // Handle string values
      aValue = aValue || '';
      bValue = bValue || '';
      
      if (sortDirection === 'desc') {
        return bValue.toString().localeCompare(aValue.toString());
      } else {
        return aValue.toString().localeCompare(bValue.toString());
      }
    });
    
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    
    return { sortedData, paginatedData, totalPages };
  }, [campaigns, currentPage, sortField, sortDirection]);

  const formatCampaignData = (campaign: any) => {
    return {
      id: campaign.STT,
      title: campaign['Tên đề tài/dự án/ý tưởng'] || '',
      description: campaign['Mô tả'] || '',
      category: campaign['Phân loại'] || 'General',
      location: 'Various Locations',
      imageUrl: '',
      currentAmount: 0,
      goalAmount: 0,
      backers: 0,
      daysLeft: 30,
      creator: `${campaign['Họ và tên lót'] || ''} ${campaign['Tên'] || ''}`.trim(),
      featured: false,
      // New fields for data_total structure
      program: campaign['Tên chương trình/cuộc thi'] || '',
      academicYear: campaign['Năm học'] || '',
      projectTitle: campaign['Tên đề tài/dự án/ý tưởng'] || '',
      firstMiddleName: campaign['Họ và tên lót'] || '',
      lastName: campaign['Tên'] || '',
      faculty: campaign['Khoa'] || '',
      university: campaign['Trường'] || '',
      result: campaign['Kết quả '] || '', // Note the space after "Kết quả"
      prizeValue: campaign['Giá trị giải thưởng '] || 0, // Note the space after "Giá trị giải thưởng"
      vluFunding: campaign['Kinh phí VLU hỗ trợ phát triển'] || 0
    };
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, sortedAndPaginatedData.totalPages));
  };

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [campaigns]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc direction
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get sort icon for a column
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              VLIC Project Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore innovative projects and competitions from Van Lang University students
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4 mb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            VLIC Project Portfolio
          </h2>
          <p className="text-red-600 mb-4">Failed to load projects. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: tableStyles }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            VLIC Project Portfolio
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore innovative projects and competitions from Van Lang University students
          </p>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 px-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'technology', label: 'Technology' },
              { id: 'environment', label: 'Environment' },
              { id: 'film', label: 'Film' },
              { id: 'community', label: 'Community' },
              { id: 'product', label: 'Product' },
              { id: 'music', label: 'Music' }
            ].map((category) => (
              <button
                key={category.id}
                className="px-3 sm:px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium text-xs sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-red-600 hover:text-white hover:border-red-600"
                onClick={() => {
                  // TODO: Implement category filtering logic
                  console.log('Selected category:', category.id);
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>



                 {/* Projects Table */}
         {sortedAndPaginatedData.paginatedData && sortedAndPaginatedData.paginatedData.length > 0 ? (
           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="overflow-x-auto table-responsive">
               <Table className="min-w-full">
                             <TableHeader>
                                   <TableRow>
                    <TableHead className="w-[120px] min-w-[120px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Tên chương trình/cuộc thi')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Program/Competition</span>
                        <span className="sm:hidden">Program</span>
                        {getSortIcon('Tên chương trình/cuộc thi')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[200px] min-w-[200px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Tên đề tài/dự án/ý tưởng')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Project Title</span>
                        <span className="sm:hidden">Title</span>
                        {getSortIcon('Tên đề tài/dự án/ý tưởng')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[120px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Họ và tên lót')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">First & Middle Name</span>
                        <span className="sm:hidden">First Name</span>
                        {getSortIcon('Họ và tên lót')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px] min-w-[80px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Tên')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Last Name</span>
                        <span className="sm:hidden">Last</span>
                        {getSortIcon('Tên')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[140px] min-w-[140px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Khoa')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Faculty
                        {getSortIcon('Khoa')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[150px] min-w-[150px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Trường')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">University</span>
                        <span className="sm:hidden">Uni</span>
                        {getSortIcon('Trường')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px] min-w-[100px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Kết quả ')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Result
                        {getSortIcon('Kết quả ')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[120px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Giá trị giải thưởng ')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Prize Value</span>
                        <span className="sm:hidden">Prize</span>
                        {getSortIcon('Giá trị giải thưởng ')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[140px] min-w-[140px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Kinh phí VLU hỗ trợ phát triển')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">VLU Development Funding</span>
                        <span className="sm:hidden">VLU Funding</span>
                        {getSortIcon('Kinh phí VLU hỗ trợ phát triển')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[120px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('Năm học')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Academic Year</span>
                        <span className="sm:hidden">Year</span>
                        {getSortIcon('Năm học')}
                      </Button>
                    </TableHead>
                  </TableRow>
               </TableHeader>
                             <TableBody>
                 {sortedAndPaginatedData.paginatedData.map((campaign, index) => {
                   const formattedCampaign = formatCampaignData(campaign);
                  
                                     return (
                                                               <TableRow key={campaign.STT} className="hover:bg-gray-50">
                                               <TableCell className="w-[120px] min-w-[120px] align-top table-cell-mobile">
                          <div className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                            {formattedCampaign.program || 'N/A'}
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[200px] min-w-[200px] align-top table-cell-mobile">
                          <div className="font-medium text-gray-900 text-sm line-clamp-3 leading-tight">
                            {formattedCampaign.projectTitle || formattedCampaign.title || 'N/A'}
                          </div>
                        </TableCell>
                       
                       <TableCell className="w-[120px] min-w-[120px] align-top table-cell-mobile">
                         <span className="text-sm text-gray-700 line-clamp-2 leading-tight">
                           {formattedCampaign.firstMiddleName || 'N/A'}
                         </span>
                       </TableCell>
                       
                       <TableCell className="w-[80px] min-w-[80px] align-top table-cell-mobile">
                         <span className="text-sm text-gray-700 font-medium">
                           {formattedCampaign.lastName || 'N/A'}
                         </span>
                       </TableCell>
                       
                       <TableCell className="w-[140px] min-w-[140px] align-top table-cell-mobile">
                         <Badge variant="secondary" className="text-xs line-clamp-2 leading-tight">
                           {formattedCampaign.faculty || 'N/A'}
                         </Badge>
                       </TableCell>
                       
                       <TableCell className="w-[150px] min-w-[150px] align-top table-cell-mobile">
                         <span className="text-sm text-gray-600 line-clamp-2 leading-tight">
                           {formattedCampaign.university || 'N/A'}
                         </span>
                       </TableCell>
                       
                       <TableCell className="w-[100px] min-w-[100px] text-center align-top table-cell-mobile">
                         <Badge 
                           variant={formattedCampaign.result?.includes('Giải') ? 'default' : 'secondary'}
                           className="text-xs line-clamp-2 leading-tight"
                         >
                           {formattedCampaign.result || 'N/A'}
                         </Badge>
                       </TableCell>
                       
                       <TableCell className="w-[120px] min-w-[120px] text-center align-top table-cell-mobile">
                         <span className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                           {formattedCampaign.prizeValue ? 
                             `${parseInt(formattedCampaign.prizeValue).toLocaleString()} VND` : 
                             'N/A'
                           }
                         </span>
                       </TableCell>
                       
                                               <TableCell className="w-[140px] min-w-[140px] text-center align-top table-cell-mobile">
                          <span className="text-sm text-gray-600 line-clamp-2 leading-tight">
                            {formattedCampaign.vluFunding || 'N/A'}
                          </span>
                        </TableCell>
                        
                        <TableCell className="w-[120px] min-w-[120px] text-center align-top table-cell-mobile">
                          <span className="text-sm text-gray-600 whitespace-nowrap">
                            {formattedCampaign.academicYear || 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                  );
                                 })}
               </TableBody>
             </Table>
             </div>
           </div>
                 ) : (
           <div className="text-center py-12 bg-white rounded-lg shadow-sm">
             <p className="text-gray-600 text-lg mb-4">No projects found.</p>
             <p className="text-gray-500">No project data available at the moment.</p>
           </div>
         )}

         {/* Pagination Controls */}
         {sortedAndPaginatedData.totalPages > 1 && (
           <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
             {/* Mobile Layout */}
             <div className="block sm:hidden">
               <div className="flex flex-col items-center space-y-4">
                 <div className="text-sm text-gray-600 text-center">
                   Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAndPaginatedData.sortedData.length)} of {sortedAndPaginatedData.sortedData.length} projects
                 </div>
                 
                 <div className="flex items-center justify-center space-x-1">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handlePreviousPage}
                     disabled={currentPage === 1}
                     className="flex items-center space-x-1 px-2"
                   >
                     <ChevronLeft className="h-4 w-4" />
                     <span className="hidden xs:inline">Prev</span>
                   </Button>
                   
                   <div className="flex items-center space-x-1">
                     {(() => {
                       const totalPages = sortedAndPaginatedData.totalPages;
                       const maxVisiblePages = 3; // Reduced for mobile
                       
                       if (totalPages <= maxVisiblePages) {
                         return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                           <Button
                             key={page}
                             variant={currentPage === page ? "default" : "outline"}
                             size="sm"
                             onClick={() => setCurrentPage(page)}
                             className="w-8 h-8 p-0 text-xs"
                           >
                             {page}
                           </Button>
                         ));
                       } else {
                         let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                         let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                         
                         if (endPage - startPage < maxVisiblePages - 1) {
                           startPage = Math.max(1, endPage - maxVisiblePages + 1);
                         }
                         
                         const pages = [];
                         for (let i = startPage; i <= endPage; i++) {
                           pages.push(i);
                         }
                         
                         return pages.map((page) => (
                           <Button
                             key={page}
                             variant={currentPage === page ? "default" : "outline"}
                             size="sm"
                             onClick={() => setCurrentPage(page)}
                             className="w-8 h-8 p-0 text-xs"
                           >
                             {page}
                           </Button>
                         ));
                       }
                     })()}
                   </div>
                   
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handleNextPage}
                     disabled={currentPage === sortedAndPaginatedData.totalPages}
                     className="flex items-center space-x-1 px-2"
                   >
                     <span className="hidden xs:inline">Next</span>
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </div>
             
             {/* Desktop Layout */}
             <div className="hidden sm:flex items-center justify-between">
               <div className="text-sm text-gray-600">
                 Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAndPaginatedData.sortedData.length)} of {sortedAndPaginatedData.sortedData.length} projects
               </div>
               
               <div className="flex items-center space-x-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handlePreviousPage}
                   disabled={currentPage === 1}
                   className="flex items-center space-x-1"
                 >
                   <ChevronLeft className="h-4 w-4" />
                   <span>Previous</span>
                 </Button>
                 
                 <div className="flex items-center space-x-1">
                   {(() => {
                     const totalPages = sortedAndPaginatedData.totalPages;
                     const maxVisiblePages = 5;
                     
                     if (totalPages <= maxVisiblePages) {
                       return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                         <Button
                           key={page}
                           variant={currentPage === page ? "default" : "outline"}
                           size="sm"
                           onClick={() => setCurrentPage(page)}
                           className="w-8 h-8 p-0"
                         >
                           {page}
                         </Button>
                       ));
                     } else {
                       let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                       let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                       
                       if (endPage - startPage < maxVisiblePages - 1) {
                         startPage = Math.max(1, endPage - maxVisiblePages + 1);
                       }
                       
                       const pages = [];
                       for (let i = startPage; i <= endPage; i++) {
                         pages.push(i);
                       }
                       
                       return pages.map((page) => (
                         <Button
                           key={page}
                           variant={currentPage === page ? "default" : "outline"}
                           size="sm"
                           onClick={() => setCurrentPage(page)}
                           className="w-8 h-8 p-0"
                         >
                           {page}
                         </Button>
                       ));
                     }
                   })()}
                 </div>
                 
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleNextPage}
                   disabled={currentPage === sortedAndPaginatedData.totalPages}
                   className="flex items-center space-x-1"
                 >
                   <span>Next</span>
                   <ChevronRight className="h-4 w-4" />
                 </Button>
               </div>
             </div>
           </div>
         )}
      </div>
    </section>
  );
};

export default CampaignsGrid;
