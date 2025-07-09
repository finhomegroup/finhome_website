
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const StatusLegend = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Campaign Status Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
            <span>Editable, not visible to public</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
            <span>Submitted for admin review</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Active</Badge>
            <span>Live and accepting donations</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            <span>Needs revision, can be resubmitted</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
            <span>Goal reached or campaign ended</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-600">Cancelled</Badge>
            <span>Campaign cancelled by owner</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
