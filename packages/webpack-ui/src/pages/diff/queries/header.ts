export default `
$statA: #.params.hash.resolveStat();
$statB: #.params.diffWith.resolveStat();
$statsACompressed: $statA.file.__statoscope.extensions.payload.compilations.resources.size.[compressor].size();
$statsBCompressed: $statB.file.__statoscope.extensions.payload.compilations.resources.size.[compressor].size();
$useCompressedSize: settingShowCompressed() and $statsACompressed and $statsBCompressed;
`;
