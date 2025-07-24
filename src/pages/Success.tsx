import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetch } = useSubscription();
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    // Refetch subscription data after successful payment
    const refreshData = async () => {
      setIsRefetching(true);
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refetch();
      setIsRefetching(false);
    };

    refreshData();
  }, [refetch]);

  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');

  if (!success && !sessionId) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Thank you for your subscription! Your payment has been processed successfully.
            </p>
            {isRefetching && (
              <p className="text-sm text-muted-foreground">
                Updating your account...
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
              disabled={isRefetching}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>

          {sessionId && (
            <div className="text-xs text-muted-foreground">
              Session ID: {sessionId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;