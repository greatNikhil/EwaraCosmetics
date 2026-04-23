export const promotionalEmailTemplate = (promoData: {
  customerName: string;
  title: string;
  content: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  discount?: string;
  expiryDate?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${promoData.title}</title>
    </head>
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎊 ${promoData.title}</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Exclusive offer just for you!</p>
        </div>

        <!-- Promotional Image (if provided) -->
        ${
          promoData.imageUrl
            ? `
          <div style="background-color: #f5f5f5; padding: 20px;">
            <img src="${promoData.imageUrl}" alt="${promoData.title}" style="width: 100%; height: auto; border-radius: 4px; display: block;">
          </div>
        `
            : ''
        }

        <!-- Main Content -->
        <div style="padding: 30px;">
          
          <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500;">
            Hi ${promoData.customerName}!
          </p>

          <!-- Discount Badge (if provided) -->
          ${
            promoData.discount
              ? `
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a2a 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Special Offer</p>
            <p style="margin: 0; font-size: 40px; font-weight: bold;">${promoData.discount}</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Off on Your Next Purchase</p>
          </div>
        `
              : ''
          }

          <!-- Main Content -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 30px; border-left: 4px solid #7a1f2b;">
            <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #333;">
              ${promoData.content}
            </p>
          </div>

          <!-- Expiry Notice (if provided) -->
          ${
            promoData.expiryDate
              ? `
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 30px; font-size: 13px; color: #856404;">
            ⏰ <strong>Valid Till:</strong> ${promoData.expiryDate} - Don't miss out!
          </div>
        `
              : ''
          }

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${promoData.ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #7a1f2b 0%, #5c1721 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
              ${promoData.ctaText}
            </a>
          </div>

          <!-- Why This Offer -->
          <h3 style="margin: 20px 0 15px 0; font-size: 14px; font-weight: bold; color: #333;">Why You'll Love This:</h3>
          <ul style="margin: 0 0 30px 0; padding-left: 20px; font-size: 13px; color: #666;">
            <li style="margin-bottom: 8px;">✓ Premium quality products</li>
            <li style="margin-bottom: 8px;">✓ Fast & free shipping</li>
            <li style="margin-bottom: 8px;">✓ 30-day money-back guarantee</li>
            <li>✓ 24/7 customer support</li>
          </ul>

          <!-- Browse Collection -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://ewara.com/shop" style="display: inline-block; background-color: #f5f5f5; color: #333; padding: 10px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; border: 2px solid #ddd;">
              Browse Our Full Collection
            </a>
          </div>

          <!-- Unsubscribe Section -->
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; text-align: center; font-size: 11px; color: #999;">
            <p style="margin: 0;">
              Not interested? You can <a href="https://ewara.com/unsubscribe" style="color: #666; text-decoration: none;">manage your preferences</a> or <a href="https://ewara.com/unsubscribe-all" style="color: #666; text-decoration: none;">unsubscribe</a>.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p style="margin: 0 0 8px 0;">© 2026 ${process.env.BUSINESS_NAME}. All rights reserved.</p>
          <p style="margin: 0;">Follow us on social media for more exclusive offers!</p>
        </div>

      </div>
    </body>
    </html>
  `;
};
