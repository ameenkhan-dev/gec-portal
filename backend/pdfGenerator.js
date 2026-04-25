/**
 * PDF Certificate Generator
 * Generates professional-looking certificates for event attendees
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a professional certificate PDF
 * @param {Object} data - Certificate data
 * @param {string} data.studentName - Student's name
 * @param {string} data.eventName - Event name
 * @param {string} data.eventDate - Event date (YYYY-MM-DD format)
 * @param {string} data.certificate_id - Certificate ID for reference
 * @returns {Promise<string>} Path to generated PDF file
 */
const generateCertificate = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            // Create certificates directory if it doesn't exist
            const certificatesDir = path.join(__dirname, 'uploads/certificates');
            if (!fs.existsSync(certificatesDir)) {
                fs.mkdirSync(certificatesDir, { recursive: true });
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const filename = `certificate_${timestamp}_${randomStr}.pdf`;
            const filepath = path.join(certificatesDir, filename);

            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                layout: 'landscape'
            });

            // Pipe to file
            const writeStream = fs.createWriteStream(filepath);
            doc.pipe(writeStream);

            // Format date
            const eventDate = new Date(data.eventDate);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Page dimensions for landscape
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            // Background - light gradient effect with border
            doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
                .stroke('#2c3e50');

            doc.rect(50, 50, pageWidth - 100, pageHeight - 100)
                .stroke('#3498db');

            // Decorative top border
            doc.fillColor('#3498db')
                .rect(50, 50, pageWidth - 100, 8)
                .fill();

            // Decorative bottom border
            doc.fillColor('#3498db')
                .rect(50, pageHeight - 58, pageWidth - 100, 8)
                .fill();

            // Header - GEC Logo/Title
            doc.fillColor('#2c3e50')
                .fontSize(36)
                .font('Helvetica-Bold')
                .text('CERTIFICATE OF APPRECIATION', { align: 'center', lineGap: 10 });

            // Subtitle
            doc.fillColor('#555555')
                .fontSize(14)
                .font('Helvetica')
                .text('This certificate is presented to', { align: 'center', lineGap: 5 });

            // Student name - highlighted
            doc.fillColor('#2c3e50')
                .fontSize(28)
                .font('Helvetica-Bold')
                .text(data.studentName.toUpperCase(), {
                    align: 'center',
                    lineGap: 15
                });

            // Certificate text
            doc.fillColor('#555555')
                .fontSize(12)
                .font('Helvetica')
                .text('For successfully attending and participating in', { align: 'center' });

            // Event name - highlighted
            doc.fillColor('#3498db')
                .fontSize(16)
                .font('Helvetica-Bold')
                .text(data.eventName, {
                    align: 'center',
                    lineGap: 5
                });

            // Event details
            doc.fillColor('#555555')
                .fontSize(11)
                .font('Helvetica')
                .text(`held on ${formattedDate}`, {
                    align: 'center',
                    lineGap: 15
                });

            // Appreciation text
            doc.fontSize(11)
                .text(
                    'We appreciate your active participation and contribution to the success of this event. ' +
                    'Your enthusiasm and engagement have made this event memorable.',
                    {
                        align: 'center',
                        width: pageWidth - 120,
                        lineGap: 10
                    }
                );

            // Signature line and seal area
            const signatureStartY = pageHeight - 140;

            // Left signature area
            doc.fillColor('#cccccc')
                .rect(80, signatureStartY, 120, 60)
                .stroke();

            doc.fillColor('#777777')
                .fontSize(10)
                .font('Helvetica')
                .text('_____________________', 90, signatureStartY + 65, { align: 'center' })
                .text('Club Administrator', 90, signatureStartY + 75, { align: 'center', width: 100 });

            // Center - GEC Seal/Logo area
            doc.fillColor('#cccccc')
                .rect(pageWidth / 2 - 60, signatureStartY, 120, 60)
                .stroke();

            doc.fillColor('#2c3e50')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('GEC SEAL', pageWidth / 2 - 50, signatureStartY + 20, { align: 'center', width: 100 });

            // Right signature area
            doc.fillColor('#cccccc')
                .rect(pageWidth - 200, signatureStartY, 120, 60)
                .stroke();

            doc.fillColor('#777777')
                .fontSize(10)
                .font('Helvetica')
                .text('_____________________', pageWidth - 190, signatureStartY + 65, { align: 'center' })
                .text('Event Coordinator', pageWidth - 190, signatureStartY + 75, { align: 'center', width: 100 });

            // Certificate ID at bottom
            doc.fillColor('#999999')
                .fontSize(8)
                .font('Helvetica')
                .text(`Certificate ID: ${data.certificate_id}`, {
                    align: 'center',
                    bottom: 10
                });

            // Finalize PDF
            doc.end();

            writeStream.on('finish', () => {
                resolve(`/uploads/certificates/${filename}`);
            });

            writeStream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Delete a certificate file
 * @param {string} certificatePath - Path to certificate (relative path from uploads)
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteCertificateFile = async (certificatePath) => {
    return new Promise((resolve, reject) => {
        try {
            const fullPath = path.join(__dirname, certificatePath);

            // Security check - ensure path is within uploads directory
            const uploadsDir = path.join(__dirname, 'uploads');
            const resolvedPath = path.resolve(fullPath);
            const resolvedUploadsDir = path.resolve(uploadsDir);

            if (!resolvedPath.startsWith(resolvedUploadsDir)) {
                return reject(new Error('Invalid certificate path'));
            }

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateCertificate,
    deleteCertificateFile
};
