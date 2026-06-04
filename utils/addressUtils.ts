export const fetchLocationFromPincode = async (pincode: string) => {
  if (!pincode || pincode.length !== 6) return null;

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District || postOffice.Block,
        state: postOffice.State
      };
    }
  } catch (error) {
    console.error('Error fetching pincode details:', error);
  }
  
  return null;
};
