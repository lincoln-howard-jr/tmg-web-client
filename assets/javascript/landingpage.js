window.addEventListener ('DOMContentLoaded', () => {
  // img resources
  const earthMap = '/assets/images/2_no_clouds_4k.jpg';
  const earthBumpMap = '/assets/images/elev_bump_4k.jpg';
  const earthSpecularMap = '/assets/images/water_4k.png';
  const banner = '/assets/images/banner with space.jpg';
  // methods to create earth
  const createEarth = () => {
    const sphere = new THREE.SphereGeometry (3, 256, 256)
    const earth = new THREE.Mesh (
      sphere,
      new THREE.MeshStandardMaterial({
        map: THREE.ImageUtils.loadTexture(earthMap),
        bumpMap: THREE.ImageUtils.loadTexture(earthBumpMap),
        bumpScale:   0.05,
        specularMap: THREE.ImageUtils.loadTexture(earthSpecularMap),
        specular: new THREE.Color('grey')
      })
    )
    return earth;
  }
  // start animation
  let frameId = false;
  // rotate earth
  const animate = () => {
    earth.rotation.y += 0.005;
    renderScene()
    frameId = requestAnimationFrame(animate)
  }
  // rerender scene
  const renderScene = () => {
    renderer.render (scene, camera);
  }
  // setup everything
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  document.querySelector ('#globe-mount').appendChild( renderer.domElement );
  let size = document.querySelector ('#globe-mount').scrollWidth;
  renderer.setSize (size, size);
  const scene = new THREE.Scene ();
  const camera = new THREE.PerspectiveCamera (
    100,
    1,
    2,
    100
  );
  // on resize
  window.addEventListener ('resize', () => {
    size = document.querySelector ('#globe-mount').scrollWidth;
    renderer.setSize (size, size);
    camera.updateProjectionMatrix ();
  });


  const ambientLight = new THREE.AmbientLight (0xbbbbbb, 2);
  scene.add (ambientLight);
  const earth = createEarth ();
  earth.position.z = -5;
  scene.add (earth);
  animate ();
});