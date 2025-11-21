
import React, { useState, useMemo } from 'react';
import { BoxItem, ContainerStats } from './types';
import { CONTAINER_TYPES, ContainerSpec } from './constants';
import { ControlPanel } from './components/ControlPanel';
import { Scene } from './components/Scene';
import { calculatePacking } from './services/packingAlgorithm';

function App() {
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentContainer, setCurrentContainer] = useState<ContainerSpec>(CONTAINER_TYPES[0]);
  const [mobileView, setMobileView] = useState<'panel' | 'scene'>('panel');

  // Handler to add multiple boxes at once
  const handleAddBoxes = (newBoxes: BoxItem[]) => {
    setBoxes(prev => [...prev, ...newBoxes]);
  };

  const handleRemoveBox = (id: string) => {
    setBoxes(prev => prev.filter(b => b.id !== id));
  };

  const handleReset = () => {
    setBoxes(prev => prev.map(b => ({ ...b, placed: false, position: undefined })));
  };

  const handleClearAll = () => {
    setBoxes([]);
  }

  const handleCalculate = () => {
    setIsCalculating(true);
    // Switch to 3D view on mobile
    setMobileView('scene');
    // Small delay to allow UI to render the loading state
    setTimeout(() => {
      // Convert ContainerSpec to Dimensions interface expected by algo
      const containerDims = {
        width: currentContainer.width,
        height: currentContainer.height,
        depth: currentContainer.depth
      };
      const packedBoxes = calculatePacking(boxes, containerDims);
      setBoxes(packedBoxes);
      setIsCalculating(false);
    }, 100);
  };

  const stats: ContainerStats = useMemo(() => {
    const containerVol = currentContainer.width * currentContainer.height * currentContainer.depth;
    let usedVol = 0;
    let placedCount = 0;
    let totalWeight = 0;
    let loadedWeight = 0;

    boxes.forEach(b => {
      totalWeight += b.weight;
      if (b.placed) {
        usedVol += b.width * b.height * b.depth;
        placedCount++;
        loadedWeight += b.weight;
      }
    });

    return {
      totalVolume: containerVol,
      usedVolume: usedVol,
      boxCount: boxes.length,
      placedCount,
      totalWeight,
      loadedWeight
    };
  }, [boxes, currentContainer]);

  const remainingWeight = currentContainer.maxLoad - stats.loadedWeight;
  const weightUsagePercent = (stats.loadedWeight / currentContainer.maxLoad) * 100;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setMobileView('panel')}
          className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${
            mobileView === 'panel'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          📦 控制面板
        </button>
        <button
          onClick={() => setMobileView('scene')}
          className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${
            mobileView === 'scene'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          🎨 3D视图
        </button>
      </div>

      {/* Sidebar Control Panel */}
      <div className={`${mobileView === 'panel' ? 'flex' : 'hidden'} lg:flex`}>
        <ControlPanel
          boxes={boxes}
          onAddBoxes={handleAddBoxes}
          onRemoveBox={handleRemoveBox}
          onCalculate={handleCalculate}
          onReset={handleReset}
          onClearAll={handleClearAll}
          stats={stats}
          isCalculating={isCalculating}
          currentContainer={currentContainer}
          onContainerChange={setCurrentContainer}
        />
      </div>

      {/* Main 3D Area */}
      <main className={`flex-1 relative flex flex-col ${mobileView === 'scene' ? 'flex' : 'hidden'} lg:flex`}>
        {/* Top Header / Dashboard Stats inside the main view */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
           <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 lg:p-5 border border-slate-200 pointer-events-auto w-full lg:w-auto">
             {/* Mobile Compact View */}
             <div className="lg:hidden grid grid-cols-2 gap-3">
               <div>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">货柜</h3>
                 <div className="text-sm font-bold text-slate-800">{currentContainer.label}</div>
               </div>
               <div>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">空间</h3>
                 <div className="text-sm font-bold text-blue-600">
                   {stats.totalVolume > 0 ? ((stats.usedVolume / stats.totalVolume) * 100).toFixed(1) : 0}%
                 </div>
               </div>
               <div>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">重量</h3>
                 <div className="text-sm font-bold text-slate-800">{stats.loadedWeight.toLocaleString()} kg</div>
               </div>
               <div>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">数量</h3>
                 <div className="text-sm font-bold text-slate-800">
                   {stats.placedCount} / {stats.boxCount}
                 </div>
               </div>
             </div>

             {/* Desktop Full View */}
             <div className="hidden lg:flex gap-8">
               <div className="min-w-[140px]">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">当前货柜</h3>
                 <div className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   {currentContainer.label}
                 </div>
                 <p className="text-xs text-slate-500 mt-1 font-mono">
                   {currentContainer.width} x {currentContainer.depth} x {currentContainer.height} cm
                 </p>
                 <p className="text-xs text-slate-400 mt-0.5 font-mono">
                   Max: {(currentContainer.maxLoad / 1000).toFixed(1)}t
                 </p>
               </div>

               <div className="w-px bg-slate-200 self-stretch"></div>

               <div className="min-w-[120px]">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">空间利用率</h3>
                 <div className="text-3xl font-black text-blue-600">
                   {stats.totalVolume > 0 ? ((stats.usedVolume / stats.totalVolume) * 100).toFixed(1) : 0}%
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                   <div
                     className="h-full bg-blue-500 transition-all duration-500"
                     style={{ width: `${stats.totalVolume > 0 ? (stats.usedVolume / stats.totalVolume) * 100 : 0}%` }}
                   ></div>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1 text-right">
                   {(stats.usedVolume / 1000000).toFixed(2)} / {(stats.totalVolume / 1000000).toFixed(2)} m³
                 </p>
               </div>

               <div className="w-px bg-slate-200 self-stretch"></div>

               <div className="flex-1 min-w-[180px]">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">重量详情 (kg)</h3>
                 <div className="flex justify-between items-baseline">
                    <div className="text-xl font-bold text-slate-800">
                      {stats.loadedWeight.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                       余: <span className={remainingWeight < 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                         {remainingWeight.toLocaleString()}
                       </span>
                    </div>
                 </div>

                 <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                   <div
                     className={`h-full transition-all duration-500 ${weightUsagePercent > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                     style={{ width: `${Math.min(weightUsagePercent, 100)}%` }}
                   ></div>
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                   <span>利用率: {weightUsagePercent.toFixed(1)}%</span>
                   <span>上限: {currentContainer.maxLoad.toLocaleString()}</span>
                 </div>
               </div>

               <div className="w-px bg-slate-200 self-stretch"></div>

                <div className="min-w-[100px]">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">装载数量</h3>
                 <div className="text-xl font-bold text-slate-800">
                   {stats.placedCount} <span className="text-sm text-slate-400 font-normal">/ {stats.boxCount}</span>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">
                   总重: {stats.totalWeight.toLocaleString()} kg
                 </p>
               </div>
             </div>
           </div>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 w-full h-full">
          <Scene boxes={boxes} container={currentContainer} />
        </div>
      </main>
    </div>
  );
}

export default App;
