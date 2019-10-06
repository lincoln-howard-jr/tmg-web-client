window.addEventListener ('DOMContentLoaded', () => {
  const mountPoint = document.querySelector ('#globe-mount');
  // img resources
  const earthMap = '/assets/images/old_2_no_clouds_4k.jpg';
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
    earth.rotation.y -= 0.005;
    earth.rotation.z -= 0.0001;
    renderScene()
    frameId = requestAnimationFrame(animate)
  }
  // rerender scene
  const renderScene = () => {
    renderer.render (scene, camera);
  }
  // setup everything
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  mountPoint.appendChild( renderer.domElement );
  let w = mountPoint.scrollWidth;
  let h = mountPoint.scrollHeight;
  let size = (w > h ? h : w);
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
    w = mountPoint.scrollWidth;
    h = mountPoint.scrollHeight;
    size = mountPoint.scrollWidth;
    renderer.setSize (size, size);
    camera.updateProjectionMatrix ();
  });


  const ambientLight = new THREE.AmbientLight (0x999999, 2.5);
  scene.add (ambientLight);
  const earth = createEarth ();
  earth.position.z = -5;
  scene.add (earth);
  animate ();
});