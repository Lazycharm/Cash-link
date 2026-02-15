import React, { useState } from 'react';
import { Review } from '@/entities/Review';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Star, Loader2, CheckCircle, MessageSquare } from 'lucide-react';

export default function ReviewDialog({ 
    isOpen, 
    onClose, 
    reviewedUser,
    entityType = 'agent',
    transactionId = null,
    onReviewSubmitted 
}) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await Review.create({
                reviewed_user_id: reviewedUser.id,
                entity_type: entityType,
                transaction_id: transactionId,
                rating: rating,
                review_text: reviewText.trim() || null,
                is_verified: !!transactionId
            });

            setIsSuccess(true);
            
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }

            setTimeout(() => {
                onClose();
                // Reset state
                setRating(0);
                setReviewText('');
                setIsSuccess(false);
            }, 2000);

        } catch (error) {
            console.error('Failed to submit review:', error);
            if (error.message?.includes('duplicate')) {
                alert('You have already reviewed this user');
            } else {
                alert('Failed to submit review. Please try again.');
            }
        }
        setIsSubmitting(false);
    };

    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                {isSuccess ? (
                    <div className="py-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600">
                            Your review has been submitted successfully.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                                Leave a Review
                            </DialogTitle>
                            <DialogDescription>
                                Share your experience with {reviewedUser?.business_name || reviewedUser?.full_name}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Star Rating */}
                            <div className="space-y-3">
                                <Label>Your Rating</Label>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star 
                                                className={`w-10 h-10 transition-colors ${
                                                    star <= (hoverRating || rating) 
                                                        ? 'text-amber-400 fill-amber-400' 
                                                        : 'text-gray-300'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                                {(hoverRating || rating) > 0 && (
                                    <p className="text-center text-sm font-medium text-gray-600">
                                        {ratingLabels[hoverRating || rating]}
                                    </p>
                                )}
                            </div>

                            {/* Review Text */}
                            <div className="space-y-2">
                                <Label>Your Review (Optional)</Label>
                                <Textarea
                                    placeholder="Share details of your experience with this agent..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-400 text-right">
                                    {reviewText.length}/500 characters
                                </p>
                            </div>

                            {transactionId && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    This review will be marked as verified (linked to a real transaction)
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || rating === 0}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Star className="w-4 h-4 mr-2" />
                                        Submit Review
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
