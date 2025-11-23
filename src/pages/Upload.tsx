import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Upload as UploadIcon, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '../services/api';

interface PredictionResult {
  plato: string;
  confianza: number;
  informacion_nutricional: {
    calories?: number;
    proteins?: number;
    fats?: number;
    carbs?: number;
    source?: string;
  } | string;
}

export default function Upload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // File created when user provides an image URL (downloaded blob -> File)
  const [urlFile, setUrlFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError('');

    try {
      const result = await apiClient.predictFood(selectedFile);
      setResults(result);
      setAnalysisComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing image');
      setAnalysisComplete(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFromUrl = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError('');

    try {
      // Download the image from the URL as a blob, convert to File and run prediction
      const resp = await fetch(imageUrl, { mode: 'cors' });
      if (!resp.ok) throw new Error(`Could not fetch image: ${resp.status}`);
      const blob = await resp.blob();

      // Try to infer filename from URL
      const urlParts = imageUrl.split('/').filter(Boolean);
      const lastPart = urlParts[urlParts.length - 1] || 'image.jpg';
      const name = lastPart.split('?')[0] || 'image.jpg';

      // Ensure a safe extension
      const extMatch = name.match(/\.(jpe?g|png|gif|webp)$/i);
      const fileName = extMatch ? name : `${name.replace(/[^a-z0-9.-]/ig,'_')}.jpg`;

      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });

      // Set preview from the downloaded file
      try { URL.revokeObjectURL(uploadedImage || ''); } catch (e) {}
      const preview = URL.createObjectURL(file);
      setUploadedImage(preview);
      setUrlFile(file);
      setSelectedFile(null);

      // Send file to predict endpoint (same as local file flow)
      const result = await apiClient.predictFood(file);
      setResults(result);
      setAnalysisComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing image from URL');
      setAnalysisComplete(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setSelectedFile(null);
    setImageUrl('');
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    setError('');
    setResults(null);
  };

  // Client-side image compressor to avoid 413/403 from server (similar to mobile)
  async function compressImage(file: File, maxWidth = 1280, quality = 0.75): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load error'));
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target?.result as string);
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });
  }

  // Shared numeric parser (preserves 0)
  const parseNum = (v: any) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  // Save meal state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const saveMeal = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    const usuarioId = Number(localStorage.getItem('usuario_id')) || null;
    if (!usuarioId) {
      setSaveError('No profile found. Please create a profile before saving meals.');
      return;
    }

    if (!results) {
      setSaveError('No analysis results to save.');
      return;
    }

    setIsSaving(true);
    try {
      // Extract nutrition values (support English and Spanish keys)
      let calories: number | undefined;
      let proteins: number | undefined;
      let fats: number | undefined;
      let carbs: number | undefined;
      // Spanish variants
      let calorias: number | undefined;
      let proteina: number | undefined;
      let grasas: number | undefined;
      let carbohidratos: number | undefined;

      if (results.informacion_nutricional && typeof results.informacion_nutricional !== 'string') {
        const info: any = results.informacion_nutricional;

        calories = parseNum(info.calories ?? info.calorias ?? undefined);
        proteins = parseNum(info.proteins ?? info.proteina ?? undefined);
        fats = parseNum(info.fats ?? info.grasas ?? undefined);
        carbs = parseNum(info.carbs ?? info.carbohidratos ?? undefined);

        calorias = parseNum(info.calorias ?? info.calories ?? undefined);
        proteina = parseNum(info.proteina ?? info.proteins ?? undefined);
        grasas = parseNum(info.grasas ?? info.fats ?? undefined);
        carbohidratos = parseNum(info.carbohidratos ?? info.carbs ?? undefined);
      }

      // If we have a selected file, compress then upload via multipart endpoint
      if (selectedFile) {
        const compressed = await compressImage(selectedFile);
        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('usuario_id', String(usuarioId));
        formData.append('meal_name', results.plato);
        formData.append('method', 'file');
        if (typeof results.confianza === 'number') formData.append('confidence', String(results.confianza));
        // Prefer sending all variants so backend receives at least one
        if (calories !== undefined) formData.append('calories', String(calories));
        if (proteins !== undefined) formData.append('proteins', String(proteins));
        if (fats !== undefined) formData.append('fats', String(fats));
        if (carbs !== undefined) formData.append('carbs', String(carbs));
        if (calorias !== undefined) formData.append('calorias', String(calorias));
        if (proteina !== undefined) formData.append('proteina', String(proteina));
        if (grasas !== undefined) formData.append('grasas', String(grasas));
        if (carbohidratos !== undefined) formData.append('carbohidratos', String(carbohidratos));

        await apiClient.uploadMeal(formData);
        setSaveSuccess('Meal saved successfully (uploaded image).');
      } else {
        // Otherwise use JSON endpoint and include image_url if available
          const payload: any = {
            usuario_id: usuarioId,
            meal_name: results.plato,
            method: 'url',
          };
          if (typeof results.confianza === 'number') payload.confidence = results.confianza;
          if (calories !== undefined) payload.calories = calories;
          if (proteins !== undefined) payload.proteins = proteins;
          if (fats !== undefined) payload.fats = fats;
          if (carbs !== undefined) payload.carbs = carbs;
          // Also include Spanish-named fields so backend receives expected keys
          if (calorias !== undefined) payload.calorias = calorias;
          if (proteina !== undefined) payload.proteina = proteina;
          if (grasas !== undefined) payload.grasas = grasas;
          if (carbohidratos !== undefined) payload.carbohidratos = carbohidratos;

          // If we downloaded a file from URL (urlFile), upload it first to get a server-stored path
          if (urlFile) {
            try {
              const compressed = await compressImage(urlFile);
              const formData = new FormData();
              formData.append('file', compressed);
              formData.append('usuario_id', String(usuarioId));
              formData.append('meal_name', results.plato);
              formData.append('method', 'url');
              if (typeof results.confianza === 'number') formData.append('confidence', String(results.confianza));
              if (calories !== undefined) formData.append('calories', String(calories));
              if (proteins !== undefined) formData.append('proteins', String(proteins));
              if (fats !== undefined) formData.append('fats', String(fats));
              if (carbs !== undefined) formData.append('carbs', String(carbs));
              if (calorias !== undefined) formData.append('calorias', String(calorias));
              if (proteina !== undefined) formData.append('proteina', String(proteina));
              if (grasas !== undefined) formData.append('grasas', String(grasas));
              if (carbohidratos !== undefined) formData.append('carbohidratos', String(carbohidratos));

              const uploadRes: any = await apiClient.uploadMeal(formData);

              // Try to detect returned image path/url
              const returnedImageUrl = uploadRes?.image_url || uploadRes?.url || uploadRes?.path || (typeof uploadRes === 'string' ? uploadRes : undefined);

              if (returnedImageUrl) {
                payload.image_url = returnedImageUrl;
                await apiClient.createMeal(payload);
                setSaveSuccess('Meal saved successfully.');
              } else if (uploadRes && (uploadRes.id || uploadRes.meal_id || uploadRes.success)) {
                // Upload endpoint created the meal already
                setSaveSuccess('Meal saved successfully (upload endpoint created the meal).');
              } else {
                // Fallback: use original uploadedImage (external URL) if available
                if (uploadedImage && uploadedImage.startsWith('http')) payload.image_url = uploadedImage;
                await apiClient.createMeal(payload);
                setSaveSuccess('Meal saved successfully.');
              }
            } catch (err) {
              throw err;
            }
          } else {
            if (uploadedImage && uploadedImage.startsWith('http')) payload.image_url = uploadedImage;
            await apiClient.createMeal(payload);
            setSaveSuccess('Meal saved successfully.');
          }
      }
    } catch (err) {
      console.error('Save meal error', err);
      setSaveError(err instanceof Error ? err.message : 'Error saving meal');
    } finally {
      setIsSaving(false);
    }
  };

  const getNutritionInfo = () => {
    if (!results || typeof results.informacion_nutricional === 'string') return null;

    const info: any = results.informacion_nutricional;
    const parseNum = (v: any) => {
      if (v === null || v === undefined || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const calories = parseNum(info.calories ?? info.calorias ?? info.calorias_kcal ?? undefined);
    const proteins = parseNum(info.proteins ?? info.proteina ?? info.proteina_g ?? undefined);
    const fats = parseNum(info.fats ?? info.grasas ?? info.grasas_g ?? undefined);
    const carbs = parseNum(info.carbs ?? info.carbohidratos ?? info.carbohidratos_g ?? undefined);

    return {
      calories,
      proteins,
      fats,
      carbs,
      raw: info,
    };
  };

  // Auto-save (similar to mobile): when analysis completes and there's a local file, compress and upload automatically
  useEffect(() => {
    let mounted = true;
    const autoSave = async () => {
      // auto-save when there is a downloaded URL file or a local selected file
      const fileToUpload = selectedFile || urlFile;
      if (!results || !fileToUpload) return;
      // Avoid double-saving if already saving
      if (isSaving) return;

      setSaveError(null);
      setSaveSuccess(null);
      setIsSaving(true);
      try {
        const compressed = await compressImage(fileToUpload);
        const usuarioId = Number(localStorage.getItem('usuario_id')) || null;
        if (!usuarioId) throw new Error('No usuario_id found in localStorage');

        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('usuario_id', String(usuarioId));
        formData.append('meal_name', results.plato);
        formData.append('method', selectedFile ? 'camera' : 'url');
        if (typeof results.confianza === 'number') formData.append('confidence', String(results.confianza));
        if (results.informacion_nutricional && typeof results.informacion_nutricional !== 'string') {
            const info: any = results.informacion_nutricional;
            const c = parseNum(info.calories ?? info.calorias ?? info.calorias_kcal ?? undefined);
            const p = parseNum(info.proteins ?? info.proteina ?? info.proteina_g ?? undefined);
            const f = parseNum(info.fats ?? info.grasas ?? info.grasas_g ?? undefined);
            const cb = parseNum(info.carbs ?? info.carbohidratos ?? info.carbohidratos_g ?? undefined);

            if (c !== undefined) {
              formData.append('calories', String(c));
              formData.append('calorias', String(c));
            }
            if (p !== undefined) {
              formData.append('proteins', String(p));
              formData.append('proteina', String(p));
            }
            if (f !== undefined) {
              formData.append('fats', String(f));
              formData.append('grasas', String(f));
            }
            if (cb !== undefined) {
              formData.append('carbs', String(cb));
              formData.append('carbohidratos', String(cb));
            }
          }

        const uploadRes = await apiClient.uploadMeal(formData);
        if (!mounted) return;
        // If upload endpoint returned something indicating creation, show success
        if (uploadRes && (uploadRes.id || uploadRes.meal_id || uploadRes.success)) {
          setSaveSuccess('Meal auto-saved successfully.');
        } else {
          setSaveSuccess('Image uploaded (auto-save).');
        }
      } catch (err) {
        console.error('Auto-save error', err);
        if (!mounted) return;
        setSaveError(err instanceof Error ? err.message : 'Error auto-saving meal');
      } finally {
        if (!mounted) return;
        setIsSaving(false);
      }
    };

    autoSave();
    return () => { mounted = false; };
  }, [results, selectedFile, urlFile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Upload & Analyze Food</h1>
          <p className="text-gray-600">Upload an image or URL to get instant nutrition analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            {/* Mode Tabs */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-[#FF5733] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    uploadMode === 'url'
                      ? 'bg-[#FF5733] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  From URL
                </button>
              </div>
            </div>

            {/* Upload File Mode */}
            {uploadMode === 'file' && (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 hover:border-[#FF5733] transition-colors"
              >
                {!uploadedImage ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
                      <UploadIcon className="w-10 h-10 text-[#FF5733]" />
                    </div>
                    <h3 className="text-gray-900 mb-2">Drag and drop your image here</h3>
                    <p className="text-gray-600 mb-6">or click to browse from your device</p>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="aspect-video rounded-xl overflow-hidden mb-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded food"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className="w-full h-12 bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                      </Button>
                      <Button
                        onClick={resetAnalysis}
                        variant="outline"
                        className="w-full rounded-xl"
                      >
                        Upload Different Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload URL Mode */}
            {uploadMode === 'url' && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="mb-4">
                  <label htmlFor="image-url" className="block text-sm text-gray-700 mb-2">
                    Image URL
                  </label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/food-image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {uploadedImage && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4">
                    <img
                      src={uploadedImage}
                      alt="Image from URL"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      const img = new Image();
                      img.onload = () => setUploadedImage(imageUrl);
                      img.onerror = () => setError('Could not load image');
                      img.src = imageUrl;
                    }}
                    className="w-full bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                  >
                    Preview Image
                  </Button>
                  <Button
                    onClick={resetAnalysis}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-red-900 font-medium">Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <UploadIcon className="w-8 h-8 text-[#FF5733]" />
                    </motion.div>
                  </div>
                  <h3 className="text-gray-900 mb-2">Analyzing your food...</h3>
                  <p className="text-gray-600">Using AI to identify and analyze nutrition</p>
                </div>
              </div>
            )}

            {analysisComplete && results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-gray-900">Analysis Complete</h3>
                  </div>
                  <div className="text-gray-900 text-lg font-semibold mb-3">{results.plato}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">Confidence:</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(results.confianza * 100).toFixed(1)}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                    <span className="text-sm text-gray-900">{(results.confianza * 100).toFixed(1)}%</span>
                  </div>
                  {/* Quick nutrition summary (calories/proteins/carbs/fats) */}
                  {getNutritionInfo() && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <div className="text-[#FF5733]">{getNutritionInfo()!.calories ?? '-'}</div>
                        <div className="text-xs text-gray-500">kcal</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-blue-600">{getNutritionInfo()!.proteins ?? '-' }g</div>
                        <div className="text-xs text-gray-500">protein</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <div className="text-[#FFC300]">{getNutritionInfo()!.carbs ?? '-'}g</div>
                        <div className="text-xs text-gray-500">carbs</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="text-green-600">{getNutritionInfo()!.fats ?? '-'}g</div>
                        <div className="text-xs text-gray-500">fat</div>
                      </div>
                    </div>
                  )}
                </div>

                {getNutritionInfo() ? (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-gray-900 mb-4">Nutrition Facts</h3>
                    <div className="space-y-4">
                      {getNutritionInfo()?.calories && (
                        <NutritionBar label="Calories" value={getNutritionInfo()!.calories!} unit="kcal" max={800} color="#FF5733" delay={0.4} />
                      )}
                      {getNutritionInfo()?.proteins && (
                        <NutritionBar label="Protein" value={getNutritionInfo()!.proteins!} unit="g" max={50} color="#3B82F6" delay={0.5} />
                      )}
                      {getNutritionInfo()?.carbs && (
                        <NutritionBar label="Carbs" value={getNutritionInfo()!.carbs!} unit="g" max={80} color="#FFC300" delay={0.6} />
                      )}
                      {getNutritionInfo()?.fats && (
                        <NutritionBar label="Fat" value={getNutritionInfo()!.fats!} unit="g" max={30} color="#10B981" delay={0.7} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <p className="text-yellow-800">
                      {typeof results.informacion_nutricional === 'string'
                        ? results.informacion_nutricional
                        : 'No nutritional information available'}
                    </p>
                  </div>
                )}

                {saveError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-700 text-sm">{saveError}</p>
                  </div>
                )}
                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <p className="text-green-700 text-sm">{saveSuccess}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={saveMeal}
                    disabled={isSaving}
                    className="w-full h-12 bg-[#06b6d4] hover:bg-[#0aa5bf] text-white rounded-xl"
                  >
                    {isSaving ? 'Saving...' : 'Save Meal'}
                  </Button>

                  <Button
                    onClick={resetAnalysis}
                    className="w-full h-12 bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                  >
                    Analyze Another Image
                  </Button>
                </div>
              </motion.div>
            )}

            {!isAnalyzing && !analysisComplete && (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6">Upload or provide a URL to see analysis results</p>
                <Button
                  onClick={() => {
                    if (uploadMode === 'file') {
                      analyzeImage();
                    } else {
                      analyzeFromUrl();
                    }
                  }}
                  disabled={uploadMode === 'file' ? !selectedFile : !imageUrl}
                  className="bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                >
                  Analyze
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NutritionBar({ label, value, unit, max, color, delay }: {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
  delay: number;
}) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm text-gray-900">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, delay }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
