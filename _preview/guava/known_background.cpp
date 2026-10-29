#include <algorithm>
#include <vector>
// Combine semantic segmentation with regions that are already black background
// in the original rendered video. Small dark facial details remain untouched.
extern "C" void clear_background(const unsigned char* source, unsigned char* result, int w, int h) {
  int n=w*h;
  std::vector<unsigned char> candidate(n);
  std::vector<int> region;region.reserve(n);
  for(int i=0;i<n;++i) candidate[i]=std::max({source[i*3],source[i*3+1],source[i*3+2]})<10;
  for(int seed=0;seed<n;++seed) {
    if(!candidate[seed]) continue;
    region.clear();region.push_back(seed);candidate[seed]=0;
    for(size_t k=0;k<region.size();++k) {
      int p=region[k];
      int a[4]={p%w?p-1:-1,p%w<w-1?p+1:-1,p>=w?p-w:-1,p<n-w?p+w:-1};
      for(int q:a) if(q>=0&&candidate[q]) {candidate[q]=0;region.push_back(q);}
    }
    if(region.size()>200) for(int p:region) result[p*3]=result[p*3+1]=result[p*3+2]=255;
  }
}
