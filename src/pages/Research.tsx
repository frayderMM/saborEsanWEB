import { Navbar } from '../components/Navbar';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Research() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="text-sm text-[#FF5733] mb-2">Research Paper</div>
                <h1 className="text-gray-900 mb-3">
                  Deep Learning Approaches for Automated Food Recognition and Nutritional Analysis
                </h1>
                <div className="text-gray-600 mb-4">
                  Sarah Johnson, Michael Chen, Emily Rodriguez
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span>Published: March 2024</span>
                  <span>•</span>
                  <span>Journal of Applied AI in Healthcare</span>
                  <span>•</span>
                  <span>DOI: 10.1234/jaih.2024.001</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="rounded-xl">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Cite Paper
                </Button>
              </div>
            </div>
          </div>

          {/* Paper Content */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 space-y-8">
            {/* Abstract */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">Abstract</h2>
              <p className="text-gray-600 leading-relaxed">
                The increasing prevalence of diet-related health conditions necessitates innovative 
                approaches to nutrition tracking and analysis. This paper presents a novel deep learning 
                framework for automated food recognition and nutritional analysis using convolutional 
                neural networks (CNNs). Our system achieves 94.2% accuracy in food classification across 
                1,000+ food categories and provides real-time nutritional information. The methodology 
                combines transfer learning from pre-trained models with custom architectures optimized 
                for food imagery. We demonstrate the practical applicability of our approach through a 
                mobile and web application that enables users to track their dietary intake effortlessly.
              </p>
            </section>

            {/* Introduction */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Nutrition plays a critical role in maintaining health and preventing chronic diseases. 
                However, traditional methods of dietary tracking are often time-consuming and prone to 
                inaccuracies. Recent advances in computer vision and deep learning have opened new 
                possibilities for automated food recognition systems.
              </p>
              <p className="text-gray-600 leading-relaxed">
                This research addresses three key challenges: (1) accurate food classification from 
                images, (2) portion size estimation, and (3) nutritional analysis. Our contributions 
                include a comprehensive dataset of labeled food images, a novel CNN architecture 
                optimized for food recognition, and a validated method for estimating nutritional content.
              </p>
            </section>

            {/* Methodology */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Methodology</h2>
              
              <h3 className="text-gray-900 mb-3 mt-6">2.1 Dataset Construction</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We compiled a dataset of 250,000 food images spanning 1,000+ categories. Images were 
                collected from multiple sources including public databases, restaurant menus, and 
                user-contributed photographs. Each image was manually annotated by nutritionists with 
                food type, ingredients, and portion size information.
              </p>

              <h3 className="text-gray-900 mb-3 mt-6">2.2 Model Architecture</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our model employs a modified ResNet-152 architecture as the backbone, with additional 
                custom layers for fine-grained food classification. We implemented attention mechanisms 
                to focus on relevant food regions and incorporated multi-scale feature extraction to 
                handle varying portion sizes and presentation styles.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 my-6 border-l-4 border-[#FF5733]">
                <h4 className="text-gray-900 mb-2">Key Technical Components:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Transfer learning from ImageNet pre-trained weights</li>
                  <li>Custom attention layers for region-of-interest detection</li>
                  <li>Multi-task learning for simultaneous classification and segmentation</li>
                  <li>Data augmentation strategies specific to food imagery</li>
                </ul>
              </div>

              <h3 className="text-gray-900 mb-3 mt-6">2.3 Nutritional Analysis Pipeline</h3>
              <p className="text-gray-600 leading-relaxed">
                After food identification, our system queries a comprehensive nutritional database 
                containing detailed information for each food item. Portion size is estimated using 
                object detection and depth estimation techniques, allowing for accurate calorie and 
                macronutrient calculations.
              </p>
            </section>

            {/* Results */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Results</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our model achieved state-of-the-art performance on multiple food recognition benchmarks:
              </p>
              
              <div className="bg-blue-50 rounded-xl p-6 my-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-blue-600 mb-1">94.2%</div>
                    <div className="text-sm text-gray-600">Classification Accuracy</div>
                  </div>
                  <div>
                    <div className="text-blue-600 mb-1">91.5%</div>
                    <div className="text-sm text-gray-600">Portion Size Accuracy</div>
                  </div>
                  <div>
                    <div className="text-blue-600 mb-1">89.8%</div>
                    <div className="text-sm text-gray-600">Nutritional Estimation</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                User studies with 500 participants showed that our application reduced dietary tracking 
                time by 85% compared to manual entry methods, while maintaining comparable accuracy in 
                nutritional assessment.
              </p>
            </section>

            {/* Discussion */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Discussion</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The high accuracy achieved by our system demonstrates the viability of automated 
                nutrition tracking using modern deep learning techniques. The application has significant 
                implications for public health, enabling individuals to make more informed dietary choices 
                with minimal effort.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Limitations include reduced accuracy for mixed dishes and culturally specific foods not 
                well-represented in training data. Future work will focus on expanding the dataset to 
                include more diverse cuisines and developing techniques for ingredient-level analysis of 
                complex meals.
              </p>
            </section>

            {/* Conclusion */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Conclusion</h2>
              <p className="text-gray-600 leading-relaxed">
                We presented a comprehensive deep learning system for automated food recognition and 
                nutritional analysis that achieves state-of-the-art performance. The practical 
                implementation through a user-friendly application demonstrates the real-world 
                applicability of this technology. As dietary health continues to be a critical concern, 
                such tools can play an important role in promoting healthier eating habits and preventing 
                diet-related diseases.
              </p>
            </section>

            {/* References */}
            <section>
              <h2 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">References</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>[1] Chen, M., et al. (2023). "Deep Learning in Food Computing." IEEE Transactions on Pattern Analysis.</p>
                <p>[2] Rodriguez, E., et al. (2023). "Automated Dietary Assessment: A Review." Journal of Nutrition Technology.</p>
                <p>[3] Kumar, A., et al. (2022). "Food-101: Mining Discriminative Components." Computer Vision and Pattern Recognition.</p>
                <p>[4] Zhang, L., et al. (2022). "Attention Mechanisms in Food Recognition Systems." Neural Computing and Applications.</p>
                <p>[5] Wilson, S., et al. (2021). "Transfer Learning for Food Image Classification." International Conference on Machine Learning.</p>
              </div>
            </section>

            {/* Keywords */}
            <section className="border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-600 mb-2">Keywords:</div>
              <div className="flex flex-wrap gap-2">
                {['Deep Learning', 'Food Recognition', 'Nutrition Analysis', 'Computer Vision', 'CNN', 'Transfer Learning', 'Mobile Health'].map((keyword) => (
                  <span key={keyword} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
