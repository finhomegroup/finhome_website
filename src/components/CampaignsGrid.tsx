
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { campaignsMockData, getResultBadgeColor, getFacultyBadgeColor, CampaignData } from '@/data/campaignsMock';

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
  const [sortField, setSortField] = useState('prizeValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;
  
  // Use mock data instead of Supabase query
  const campaigns = campaignsMockData;
  const isLoading = false;
  const error = null;

  // Sort data by selected field and direction, handle pagination
  const sortedAndPaginatedData = useMemo(() => {
    if (!campaigns) return { sortedData: [], paginatedData: [], totalPages: 0 };
    
    // Sort by selected field and direction
    const sortedData = [...campaigns].sort((a, b) => {
      let aValue: any = a[sortField as keyof CampaignData];
      let bValue: any = b[sortField as keyof CampaignData];
      
      // Handle numeric values
      if (sortField === 'prizeValue' || sortField === 'id') {
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
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 mb-4">
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
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 mb-4">
            VLIC Project Portfolio
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2 py-3">
            Explore innovative projects and competitions <br />from Van Lang University students
          </p>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 px-2">
            {[
              { id: 'all', label: 'All', color: '#fec443' },
              { id: 'technology', label: 'Technology', color: '#3b387d' },
              { id: 'environment', label: 'Environment', color: '#00a9a5' },
              { id: 'film', label: 'Film', color: '#f7a4a4' },
              { id: 'community', label: 'Community', color: '#00664f' },
              { id: 'product', label: 'Product', color: '#458fcd' },
              { id: 'music', label: 'Music', color: '#f36d2f' }
            ].map((category) => (
              <button
                key={category.id}
                className="px-3 sm:px-6 py-2 rounded-full border font-medium text-xs sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-md text-white w-36 sm:w-36"
                style={{
                  backgroundColor: category.color,
                  borderColor: category.color
                }}
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
                    <TableHead className="w-[100px] min-w-[100px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('programCompetition')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Program/Competition</span>
                        <span className="sm:hidden">Program</span>
                        {getSortIcon('programCompetition')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px] min-w-[80px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('projectTitle')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Project Title</span>
                        <span className="sm:hidden">Title</span>
                        {getSortIcon('projectTitle')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px] min-w-[80px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('firstName')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">First & Middle Name</span>
                        <span className="sm:hidden">First Name</span>
                        {getSortIcon('firstName')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[30px] min-w-[30px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('lastName')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Last Name</span>
                        <span className="sm:hidden">Last</span>
                        {getSortIcon('lastName')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[180px] min-w-[180px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('faculty')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Faculty
                        {getSortIcon('faculty')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px] min-w-[80px] table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('university')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">University</span>
                        <span className="sm:hidden">Uni</span>
                        {getSortIcon('university')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[120px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('result')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Result
                        {getSortIcon('result')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[180px] min-w-[180px] text-center table-header-mobile">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('prizeValue')}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        <span className="hidden sm:inline">Prize Value</span>
                        <span className="sm:hidden">Prize</span>
                        {getSortIcon('prizeValue')}
                      </Button>
                    </TableHead>
                  </TableRow>
               </TableHeader>
                             <TableBody>
                 {sortedAndPaginatedData.paginatedData.map((campaign, index) => {
                                     return (
                                                               <TableRow key={campaign.id} className="hover:bg-gray-50">
                                               <TableCell className="w-[120px] min-w-[120px] align-top table-cell-mobile">
                          <div className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                            {campaign.programCompetition || 'N/A'}
                          </div>
                        </TableCell>
                        
                        <TableCell className="w-[60px] min-w-[60px] align-top table-cell-mobile">
                          <div className="font-medium text-gray-900 text-sm line-clamp-3 leading-tight">
                            {campaign.projectTitle || 'N/A'}
                          </div>
                        </TableCell>
                       
                       <TableCell className="w-[100px] min-w-[100px] align-top table-cell-mobile">
                         <span className="text-sm text-gray-700 line-clamp-2 leading-tight">
                           {campaign.firstName || 'N/A'}
                         </span>
                       </TableCell>
                       
                       <TableCell className="w-[60px] min-w-[60px] align-top table-cell-mobile">
                         <span className="text-sm text-gray-700 font-medium">
                           {campaign.lastName || 'N/A'}
                         </span>
                       </TableCell>
                       
                       <TableCell className="w-[120px] min-w-[120px] text-center align-top table-cell-mobile">
                         <Badge className={`text-xs line-clamp-2 leading-tight ${getFacultyBadgeColor()}`}>
                           {campaign.faculty || 'N/A'}
                         </Badge>
                       </TableCell>
                       
                       <TableCell className="w-[80px] min-w-[80px] align-top table-cell-mobile">
                         <span className="text-sm text-gray-600 line-clamp-2 leading-tight">
                           {campaign.university || 'N/A'}
                         </span>
                       </TableCell>
                       
                       <TableCell className="w-[100px] min-w-[100px] text-center align-top table-cell-mobile">
                         <div className="flex justify-center">
                           <Badge className={`text-xs line-clamp-2 leading-tight ${getResultBadgeColor(campaign.result)}`}>
                             {campaign.result || 'N/A'}
                           </Badge>
                         </div>
                       </TableCell>
                       
                       <TableCell className="w-[100px] min-w-[100px] text-center align-top table-cell-mobile">
                         <span className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                           {campaign.prizeValue || 'N/A'}
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
